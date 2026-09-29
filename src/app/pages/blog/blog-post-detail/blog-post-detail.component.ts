import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SeoService } from '../../../core/seo.service';
import { FirebaseService } from '../../../core/services/firebase.service';
import { BlogPost } from '../../../core/models/blog.model';

@Component({
  selector: 'app-blog-post-detail',
  templateUrl: './blog-post-detail.component.html'
})
export class BlogPostDetailComponent implements OnInit {
  post: BlogPost | null = null;
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
