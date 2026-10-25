import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SeoService } from '../../../core/seo.service';
import { FirebaseService } from '../../../core/services/firebase.service';
import { AuthService } from '../../../core/services/auth.service';
import { BlogPost, ArticleComment } from '../../../core/models/blog.model';

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
export class BlogPostDetailComponent implements OnInit, OnDestroy {
  post: BlogPost | null = null;
  contentSegments: ContentSegment[] = [];
  isLoading = true;
  errorMsg = '';

  showEditorModal = false;
  showDeleteModal = false;
  isDeleting = false;

  // Ranking & Community Voting State
  userVote: 1 | -1 | 0 = 0;
  isVoting = false;
  voteScore = 0;
  upvotesCount = 0;
  downvotesCount = 0;
  voteAuthWarning = '';

  // Comments State
  comments: ArticleComment[] = [];
  isLoadingComments = false;
  isSubmittingComment = false;
  commentError = '';
  newCommentText = '';

  private authSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public firebaseService: FirebaseService,
    public authService: AuthService,
    private seoService: SeoService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/blog']);
      return;
    }

    this.loadPost(id);

    // Watch auth changes to update user's vote status and comment permissions
    this.authSub = this.firebaseService.currentUser$.subscribe(() => {
      if (this.post?.id) {
        this.loadUserVote(this.post.id);
      }
    });
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
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

      this.voteScore = this.post.score ?? ((this.post.upvotesCount || 0) - (this.post.downvotesCount || 0));
      this.upvotesCount = this.post.upvotesCount ?? (this.voteScore > 0 ? this.voteScore : 0);
      this.downvotesCount = this.post.downvotesCount ?? 0;

      this.contentSegments = this.parseContentWithDynamicAds(this.post.content, this.post);

      this.seoService.update(
        `${this.post.title} | Bhakti Pokhrel Blog`,
        this.post.description || this.post.content.slice(0, 160),
        `/blog/${id}`,
        this.post.imageUrl
      );

      // Load comments and current user vote in parallel
      await Promise.all([
        this.loadComments(id),
        this.loadUserVote(id)
      ]);
    } catch (err: any) {
      console.error('Error fetching post:', err);
      this.errorMsg = 'Failed to load post. It may be private or deleted.';
    } finally {
      this.isLoading = false;
    }
  }

  async loadUserVote(postId: string): Promise<void> {
    if (!this.firebaseService.currentUser) {
      this.userVote = 0;
      return;
    }
    try {
      this.userVote = await this.firebaseService.getUserVote(postId);
    } catch (err) {
      console.warn('Could not load user vote:', err);
      this.userVote = 0;
    }
  }

  async loadComments(postId: string): Promise<void> {
    this.isLoadingComments = true;
    try {
      this.comments = await this.firebaseService.getComments(postId);
    } catch (err) {
      console.warn('Could not fetch comments:', err);
    } finally {
      this.isLoadingComments = false;
    }
  }

  /**
   * Only signed-in users can Up arrow or Down arrow the article to rank it.
   */
  async onVote(direction: 'up' | 'down'): Promise<void> {
    if (!this.firebaseService.currentUser) {
      this.voteAuthWarning = 'Please sign in to vote and rank this article.';
      this.authService.openAuthModal();
      return;
    }

    if (!this.post?.id || this.isVoting) return;

    this.voteAuthWarning = '';
    this.isVoting = true;

    // Optimistic UI updates
    const prevVote = this.userVote;
    const targetVote: 1 | -1 = direction === 'up' ? 1 : -1;
    const nextVote: 1 | -1 | 0 = prevVote === targetVote ? 0 : targetVote;

    // Calculate score delta
    let delta = 0;
    if (prevVote === 1) delta -= 1;
    else if (prevVote === -1) delta += 1;

    if (nextVote === 1) delta += 1;
    else if (nextVote === -1) delta -= 1;

    this.userVote = nextVote;
    this.voteScore += delta;
    if (direction === 'up') {
      this.upvotesCount = Math.max(0, this.upvotesCount + (nextVote === 1 ? 1 : -1));
    } else {
      this.downvotesCount = Math.max(0, this.downvotesCount + (nextVote === -1 ? 1 : -1));
    }

    try {
      const res = await this.firebaseService.voteArticle(this.post.id, direction);
      this.userVote = res.userVote;
      this.voteScore = res.score;
      this.upvotesCount = res.upvotes;
      this.downvotesCount = res.downvotes;
      if (this.post) {
        this.post.score = res.score;
        this.post.upvotesCount = res.upvotes;
        this.post.downvotesCount = res.downvotes;
      }
    } catch (err: any) {
      console.error('Voting failed:', err);
      // Revert optimistic updates
      this.userVote = prevVote;
      this.voteScore -= delta;
      alert(err?.message || 'Failed to submit vote. Please try again.');
    } finally {
      this.isVoting = false;
    }
  }

  /**
   * Only signed-in users can comment on the article.
   */
  async submitComment(): Promise<void> {
    if (!this.firebaseService.currentUser) {
      this.commentError = 'Please sign in to share your thoughts.';
      this.authService.openAuthModal();
      return;
    }

    const clean = this.newCommentText.trim();
    if (!clean) {
      this.commentError = 'Please enter your thoughts before posting.';
      return;
    }

    if (!this.post?.id) return;

    this.isSubmittingComment = true;
    this.commentError = '';

    try {
      const newComment = await this.firebaseService.addComment(this.post.id, clean);
      this.comments.push(newComment);
      this.newCommentText = '';
      if (this.post) {
        this.post.commentsCount = (this.post.commentsCount || 0) + 1;
      }
    } catch (err: any) {
      console.error('Comment submission error:', err);
      this.commentError = err?.message || 'Could not post comment. Please try again.';
    } finally {
      this.isSubmittingComment = false;
    }
  }

  async deleteComment(commentId: string): Promise<void> {
    if (!this.post?.id) return;
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await this.firebaseService.deleteComment(this.post.id, commentId);
      this.comments = this.comments.filter(c => c.id !== commentId);
      if (this.post && this.post.commentsCount) {
        this.post.commentsCount = Math.max(0, this.post.commentsCount - 1);
      }
    } catch (err: any) {
      console.error('Comment deletion failed:', err);
      alert('Could not delete comment: ' + (err?.message || 'Permission denied'));
    }
  }

  canDeleteComment(comment: ArticleComment): boolean {
    const user = this.firebaseService.currentUser;
    if (!user) return false;
    return user.uid === comment.authorId || this.firebaseService.isAdmin();
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
