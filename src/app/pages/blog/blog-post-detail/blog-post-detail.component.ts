import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SeoService } from '../../../core/seo.service';
import { FirebaseService } from '../../../core/services/firebase.service';
import { BlogPost } from '../../../core/models/blog.model';

export interface ContentSegment {
  type: 'h2' | 'h3' | 'quote' | 'code' | 'paragraph' | 'ad';
  text?: string;
  codeLang?: string;
  adLayout?: 'in-article' | '';
  adFormat?: 'auto' | 'fluid';
  adSlot?: string;
  label?: string;
}

@Component({
  selector: 'app-blog-post-detail',
  templateUrl: './blog-post-detail.component.html'
})
export class BlogPostDetailComponent implements OnInit {
  post: BlogPost | null = null;
  contentSegments: ContentSegment[] = [];
  isLoading = true;
  errorMsg = '';

  showEditorModal = false;
  showDeleteModal = false;
  isDeleting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public firebaseService: FirebaseService,
    private seoService: SeoService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/blog']);
      return;
    }

    this.loadPost(id);
  }

  async loadPost(id: string): Promise<void> {
    this.isLoading = true;
    this.errorMsg = '';
    try {
      this.post = await this.firebaseService.getPost(id);
      if (!this.post) {
        this.errorMsg = 'Post not found or you do not have permission to view it.';
        return;
      }

      this.contentSegments = this.parseContentWithDynamicAds(this.post.content, this.post);

      this.seoService.update(
        `${this.post.title} | Bhakti Pokhrel Blog`,
        this.post.description || this.post.content.slice(0, 160),
        `/blog/${id}`,
        this.post.imageUrl
      );
    } catch (err: any) {
      console.error('Error fetching post:', err);
      this.errorMsg = 'Failed to load post. It may be private or deleted.';
    } finally {
      this.isLoading = false;
    }
  }

  /**
   * Intelligently parses article content into headings, quotes, code blocks,
   * paragraphs, and dynamically injects Google AdSense In-Article ads at
   * optimal reading intervals compliant with AdSense Valuable Inventory policies.
   */
  parseContentWithDynamicAds(content: string, post: BlogPost): ContentSegment[] {
    if (!content) return [];

    const segments: ContentSegment[] = [];
    const lines = content.split('\n');
    let currentParagraph: string[] = [];
    let inCodeBlock = false;
    let codeLanguage = '';
    let currentCode: string[] = [];

    const flushParagraph = () => {
      if (currentParagraph.length > 0) {
        const text = currentParagraph.join('\n').trim();
        if (text) {
          if (text.startsWith('### ')) {
            segments.push({ type: 'h3', text: text.replace(/^###\s+/, '') });
          } else if (text.startsWith('## ')) {
            segments.push({ type: 'h2', text: text.replace(/^##\s+/, '') });
          } else if (text.startsWith('> ')) {
            segments.push({ type: 'quote', text: text.replace(/^>\s*/, '') });
          } else {
            segments.push({ type: 'paragraph', text });
          }
        }
        currentParagraph = [];
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.trim().startsWith('```')) {
        if (!inCodeBlock) {
          flushParagraph();
          inCodeBlock = true;
          codeLanguage = line.trim().replace(/^```/, '').trim() || 'code';
          currentCode = [];
        } else {
          inCodeBlock = false;
          segments.push({
            type: 'code',
            text: currentCode.join('\n'),
            codeLang: codeLanguage
          });
          currentCode = [];
        }
        continue;
      }

      if (inCodeBlock) {
        currentCode.push(line);
        continue;
      }

      if (line.trim() === '') {
        flushParagraph();
      } else {
        currentParagraph.push(line);
      }
    }
    flushParagraph();

    // If ads are disabled on this post, return clean content
    if (post.showAds === false) {
      return segments;
    }

    // Find valid paragraph insertion points
    const paragraphIndices: number[] = [];
    for (let i = 0; i < segments.length; i++) {
      if (segments[i].type === 'paragraph') {
        paragraphIndices.push(i);
      }
    }

    const totalParagraphs = paragraphIndices.length;
    // Policy rule: Only insert in-article ads if there are at least 3 substantive paragraphs
    if (totalParagraphs < 3) {
      return segments;
    }

    // Determine injection positions:
    // - For 3 to 6 paragraphs: 1 in-article ad after 2nd/3rd paragraph (~35-45% into post)
    // - For 7+ paragraphs: 2 in-article ads (~35% and ~72% depth)
    const injectionPoints: number[] = [];
    if (totalParagraphs >= 3 && totalParagraphs < 7) {
      const targetP = Math.min(2, totalParagraphs - 1);
      injectionPoints.push(paragraphIndices[targetP]);
    } else if (totalParagraphs >= 7) {
      const firstTarget = Math.max(1, Math.floor(totalParagraphs * 0.35));
      const secondTarget = Math.max(firstTarget + 2, Math.floor(totalParagraphs * 0.72));
      injectionPoints.push(paragraphIndices[firstTarget]);
      if (secondTarget < totalParagraphs) {
        injectionPoints.push(paragraphIndices[secondTarget]);
      }
    }

    // Insert from end to beginning to preserve earlier index values
    const result = [...segments];
    injectionPoints.sort((a, b) => b - a).forEach((idx) => {
      result.splice(idx + 1, 0, {
        type: 'ad',
        adLayout: 'in-article',
        adFormat: 'fluid',
        adSlot: post.adSlotId || '',
        label: 'Advertisement · In-Article'
      });
    });

    return result;
  }

  isAuthor(): boolean {
    const user = this.firebaseService.currentUser;
    return !!(user && this.post && this.post.authorId === user.uid);
  }

  isScheduledFuture(): boolean {
    if (!this.post?.scheduledAt) return false;
    return new Date(this.post.scheduledAt).getTime() > new Date().getTime();
  }

  calculateReadTime(content: string): number {
    const words = content ? content.trim().split(/\s+/).length : 0;
    return Math.max(1, Math.ceil(words / 200));
  }

  onPostUpdated(updated: BlogPost): void {
    this.post = updated;
    this.contentSegments = this.parseContentWithDynamicAds(this.post.content, this.post);
    this.showEditorModal = false;
  }

  async confirmDelete(): Promise<void> {
    if (!this.post?.id) return;
    this.isDeleting = true;
    try {
      await this.firebaseService.deletePost(this.post.id);
      this.router.navigate(['/blog']);
    } catch (err: any) {
      console.error('Delete failed:', err);
      alert('Could not delete post: ' + (err?.message || 'Permission denied'));
    } finally {
      this.isDeleting = false;
    }
  }

  getDomain(url: string): string {
    try {
      const u = new URL(url.startsWith('http') ? url : `https://${url}`);
      return u.hostname.replace('www.', '');
    } catch {
      return url;
    }
  }

  shareArticle(): void {
    if (navigator.share && this.post) {
      navigator.share({
        title: this.post.title,
        text: this.post.description,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Article link copied to clipboard!');
    }
  }
}
