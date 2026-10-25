import { Component, OnInit } from '@angular/core';
import { SeoService } from '../../../core/seo.service';
import { FirebaseService } from '../../../core/services/firebase.service';
import { AuthService } from '../../../core/services/auth.service';
import { BlogPost } from '../../../core/models/blog.model';

export type BlogFilterTab = 'all' | 'top-ranked' | 'most-discussed' | 'public' | 'scheduled' | 'private';

@Component({
  selector: 'app-blog-list',
  templateUrl: './blog-list.component.html'
})
export class BlogListComponent implements OnInit {
  posts: BlogPost[] = [];
  filteredPosts: BlogPost[] = [];
  isLoading = true;
  errorMsg = '';

  // Filter & Search State
  searchQuery = '';
  activeTab: BlogFilterTab = 'all';
  tenantId = 'default';
  availableTenants: string[] = ['default', 'cloud-systems', 'mobile-lab'];

  // User Votes on Posts (for card active state)
  userVotesMap = new Map<string, 1 | -1 | 0>();
  votingPostId: string | null = null;

  // Modal States
  showAuthModal = false;
  showEditorModal = false;
  showPendingApprovalModal = false;
  postToEdit: BlogPost | null = null;
  postToDelete: BlogPost | null = null;
  isDeleting = false;

  get isUserApproved(): boolean {
    return this.firebaseService.isAdmin() || this.firebaseService.isApprovedAuthor();
  }

  constructor(
    public firebaseService: FirebaseService,
    public authService: AuthService,
    private seoService: SeoService
  ) {}

  ngOnInit(): void {
    this.seoService.update(
      'Engineering & Systems Blog | Bhakti Pokhrel',
      'Technical insights, architectural deep dives, full-stack SaaS distributed systems, and native iOS development patterns.',
      '/blog'
    );

    this.loadPosts();

    // Listen to auth changes so we refresh private posts when user logs in/out
    this.firebaseService.currentUser$.subscribe(() => {
      this.loadPosts();
    });
  }

  async loadPosts(): Promise<void> {
    this.isLoading = true;
    this.errorMsg = '';
    try {
      this.posts = await this.firebaseService.getPosts(this.tenantId);
      this.applyFilter();

      // If user is authenticated, query their votes for these posts
      if (this.firebaseService.currentUser) {
        this.posts.forEach(async (p) => {
          if (p.id) {
            const v = await this.firebaseService.getUserVote(p.id);
            this.userVotesMap.set(p.id, v);
          }
        });
      }
    } catch (err: any) {
      console.error('Failed to load posts:', err);
      this.errorMsg = 'Could not load posts. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  onTenantChange(tenant: string): void {
    this.tenantId = tenant;
    this.firebaseService.setActiveTenant(tenant);
    this.loadPosts();
  }

  setTab(tab: BlogFilterTab): void {
    this.activeTab = tab;
    this.applyFilter();
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  applyFilter(): void {
    const q = this.searchQuery.trim().toLowerCase();
    const now = new Date().getTime();

    let list = this.posts.filter((post) => {
      // Tab filter
      if (this.activeTab === 'public') {
        if (post.status !== 'public') return false;
        if (post.scheduledAt && new Date(post.scheduledAt).getTime() > now) return false;
      } else if (this.activeTab === 'scheduled') {
        if (!post.scheduledAt || new Date(post.scheduledAt).getTime() <= now) return false;
      } else if (this.activeTab === 'private') {
        if (post.status !== 'private') return false;
      }

      // Search query filter
      if (q) {
        const titleMatch = post.title.toLowerCase().includes(q);
        const descMatch = post.description?.toLowerCase().includes(q) || false;
        const contentMatch = post.content.toLowerCase().includes(q);
        const authorMatch = post.authorName?.toLowerCase().includes(q) || false;
        if (!titleMatch && !descMatch && !contentMatch && !authorMatch) return false;
      }

      return true;
    });

    // Ranking and sorting logic
    if (this.activeTab === 'top-ranked') {
      list.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
    } else if (this.activeTab === 'most-discussed') {
      list.sort((a, b) => (b.commentsCount ?? 0) - (a.commentsCount ?? 0));
    } else {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    this.filteredPosts = list;
  }

  async onCardVote(post: BlogPost, direction: 'up' | 'down', event: Event): Promise<void> {
    event.stopPropagation();
    event.preventDefault();

    if (!this.firebaseService.currentUser) {
      this.authService.openAuthModal();
      return;
    }

    if (!post.id || this.votingPostId === post.id) return;

    this.votingPostId = post.id;
    try {
      const res = await this.firebaseService.voteArticle(post.id, direction);
      post.score = res.score;
      post.upvotesCount = res.upvotes;
      post.downvotesCount = res.downvotes;
      this.userVotesMap.set(post.id, res.userVote);
      if (this.activeTab === 'top-ranked') {
        this.applyFilter();
      }
    } catch (err: any) {
      console.error('Card vote failed:', err);
    } finally {
      this.votingPostId = null;
    }
  }

  getPostVote(postId?: string): 1 | -1 | 0 {
    if (!postId || !this.firebaseService.currentUser) return 0;
    return this.userVotesMap.get(postId) || 0;
  }

  openWriteModal(): void {
    if (!this.firebaseService.currentUser) {
      this.showAuthModal = true;
      return;
    }
    this.postToEdit = null;
    this.showEditorModal = true;
  }

  openEditModal(post: BlogPost, event: Event): void {
    event.stopPropagation();
    this.postToEdit = post;
    this.showEditorModal = true;
  }

  openDeleteConfirm(post: BlogPost, event: Event): void {
    event.stopPropagation();
    this.postToDelete = post;
  }

  async confirmDelete(): Promise<void> {
    if (!this.postToDelete || !this.postToDelete.id) return;
    this.isDeleting = true;
    try {
      await this.firebaseService.deletePost(this.postToDelete.id);
      this.postToDelete = null;
      await this.loadPosts();
    } catch (err: any) {
      console.error('Delete error:', err);
      alert('Could not delete post: ' + (err?.message || 'Permission denied'));
    } finally {
      this.isDeleting = false;
    }
  }

  cancelDelete(): void {
    this.postToDelete = null;
  }

  onPostSaved(savedPost: BlogPost): void {
    this.loadPosts();
  }

  isAuthor(post: BlogPost): boolean {
    const user = this.firebaseService.currentUser;
    return !!(user && post.authorId === user.uid);
  }

  isScheduledFuture(post: BlogPost): boolean {
    if (!post.scheduledAt) return false;
    return new Date(post.scheduledAt).getTime() > new Date().getTime();
  }

  calculateReadTime(content: string): number {
    const words = content ? content.trim().split(/\s+/).length : 0;
    return Math.max(1, Math.ceil(words / 200));
  }
}
