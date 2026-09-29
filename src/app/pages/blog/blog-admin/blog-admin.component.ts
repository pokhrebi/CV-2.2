import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { BlogPost, UserProfile } from '../../../core/models/blog.model';
import { FirebaseService } from '../../../core/services/firebase.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-blog-admin',
  templateUrl: './blog-admin.component.html'
})
export class BlogAdminComponent implements OnInit, OnDestroy {
  // Navigation Tabs: Articles vs Author Approvals
  activeSection: 'posts' | 'authors' = 'posts';

  // State
  allPosts: BlogPost[] = [];
  filteredPosts: BlogPost[] = [];
  paginatedPosts: BlogPost[] = [];
  isLoading = false;
  errorMsg = '';
  successMsg = '';

  // Author Management State
  usersList: UserProfile[] = [];
  isLoadingUsers = false;

  // Filter & Search Controls
  searchQuery = '';
  statusFilter: 'all' | 'public' | 'private' | 'scheduled' = 'all';
  tenantFilter = 'all';
  availableTenants: string[] = ['all', 'default'];

  // Pagination State
  currentPage = 1;
  pageSize = 10;
  pageSizeOptions = [5, 10, 20, 50];
  totalPages = 1;

  // Selection & Batch Operations
  selectedPostIds: Set<string> = new Set<string>();

  // Modals & Popups
  showEditorModal = false;
  showAuthModal = false;
  postToEdit: BlogPost | null = null;
  postToDelete: BlogPost | null = null;
  isBatchDeleting = false;

  private authSub?: Subscription;

  constructor(
    public firebaseService: FirebaseService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadPosts();
    this.loadUsers();
    this.authSub = this.authService.currentUser$.subscribe(() => {
      this.loadPosts();
      this.loadUsers();
    });
  }

  ngOnDestroy(): void {
    this.authSub?.unsubscribe();
  }

  async loadPosts(): Promise<void> {
    this.isLoading = true;
    this.errorMsg = '';
    try {
      this.allPosts = await this.firebaseService.getPosts('all');
      this.extractTenants();
      this.applyFilterAndPagination();
    } catch (err: any) {
      console.error('Failed to load posts in admin:', err);
      this.errorMsg = err?.message || 'Could not load posts from Firestore.';
    } finally {
      this.isLoading = false;
    }
  }

  private extractTenants(): void {
    const tenants = new Set<string>(['all', 'default']);
    this.allPosts.forEach((p) => {
      if (p.tenantId) {
        tenants.add(p.tenantId);
      }
    });
    this.availableTenants = Array.from(tenants);
  }

  // --- Filtering & Searching ---

  onSearchOrFilterChange(): void {
    this.currentPage = 1;
    this.applyFilterAndPagination();
  }

  applyFilterAndPagination(): void {
    let result = [...this.allPosts];

    // Status Filter
    if (this.statusFilter === 'public') {
      result = result.filter((p) => p.status === 'public');
    } else if (this.statusFilter === 'private') {
      result = result.filter((p) => p.status === 'private');
    } else if (this.statusFilter === 'scheduled') {
      result = result.filter((p) => {
        if (!p.scheduledAt && !p.scheduledDate) return false;
        const schedTime = new Date(p.scheduledAt || p.scheduledDate || '').getTime();
        return schedTime > Date.now();
      });
    }

    // Tenant Filter
    if (this.tenantFilter !== 'all') {
      result = result.filter((p) => (p.tenantId || 'default') === this.tenantFilter);
    }

    // Search Query Filter
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase().trim();
      result = result.filter((p) => {
        const titleMatch = p.title?.toLowerCase().includes(q);
        const descMatch = p.description?.toLowerCase().includes(q);
        const authorMatch = p.authorName?.toLowerCase().includes(q) || p.authorEmail?.toLowerCase().includes(q);
        return titleMatch || descMatch || authorMatch;
      });
    }

    this.filteredPosts = result;
    this.totalPages = Math.max(1, Math.ceil(this.filteredPosts.length / this.pageSize));

    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    // Paginate slice
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.paginatedPosts = this.filteredPosts.slice(startIndex, startIndex + this.pageSize);

    // Clean up selections that might not exist anymore
    const activeIds = new Set(this.filteredPosts.map((p) => p.id || ''));
    Array.from(this.selectedPostIds).forEach((id) => {
      if (!activeIds.has(id)) {
        this.selectedPostIds.delete(id);
      }
    });
  }

  // --- Pagination Controls ---

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilterAndPagination();
    }
  }

  onPageSizeChange(newSize: number): void {
    this.pageSize = Number(newSize);
    this.currentPage = 1;
    this.applyFilterAndPagination();
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(this.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  }

  get startRecordIndex(): number {
    if (this.filteredPosts.length === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get endRecordIndex(): number {
    return Math.min(this.currentPage * this.pageSize, this.filteredPosts.length);
  }

  // --- Selection Management ---

  isAllSelectedOnPage(): boolean {
    if (this.paginatedPosts.length === 0) return false;
    return this.paginatedPosts.every((p) => p.id && this.selectedPostIds.has(p.id));
  }

  toggleSelectAllOnPage(): void {
    if (this.isAllSelectedOnPage()) {
      this.paginatedPosts.forEach((p) => {
        if (p.id) this.selectedPostIds.delete(p.id);
      });
    } else {
      this.paginatedPosts.forEach((p) => {
        if (p.id) this.selectedPostIds.add(p.id);
      });
    }
  }

  togglePostSelection(id?: string): void {
    if (!id) return;
    if (this.selectedPostIds.has(id)) {
      this.selectedPostIds.delete(id);
    } else {
      this.selectedPostIds.add(id);
    }
  }

  clearSelection(): void {
    this.selectedPostIds.clear();
  }

  // --- Batch Operations ---

  async batchSetStatus(newStatus: 'public' | 'private'): Promise<void> {
    if (this.selectedPostIds.size === 0) return;

    this.isLoading = true;
    this.errorMsg = '';
    const ids = Array.from(this.selectedPostIds);

    try {
      for (const id of ids) {
        await this.firebaseService.updatePost(id, { status: newStatus });
      }
      this.showToast(`Updated ${ids.length} post(s) to ${newStatus}.`);
      this.clearSelection();
      await this.loadPosts();
    } catch (err: any) {
      this.errorMsg = err?.message || 'Failed to update selected posts.';
    } finally {
      this.isLoading = false;
    }
  }

  confirmBatchDelete(): void {
    if (this.selectedPostIds.size === 0) return;
    this.isBatchDeleting = true;
  }

  async executeBatchDelete(): Promise<void> {
    const ids = Array.from(this.selectedPostIds);
    this.isLoading = true;
    this.errorMsg = '';
    this.isBatchDeleting = false;

    try {
      for (const id of ids) {
        await this.firebaseService.deletePost(id);
      }
      this.showToast(`Successfully deleted ${ids.length} post(s).`);
      this.clearSelection();
      await this.loadPosts();
    } catch (err: any) {
      this.errorMsg = err?.message || 'Failed to delete selected posts.';
    } finally {
      this.isLoading = false;
    }
  }

  // --- Single Item Actions ---

  openNewPost(): void {
    if (!this.authService.isAuthenticated) {
      this.showAuthModal = true;
      return;
    }
    this.postToEdit = null;
    this.showEditorModal = true;
  }

  openEditPost(post: BlogPost): void {
    if (!this.authService.isAuthenticated) {
      this.showAuthModal = true;
      return;
    }
    this.postToEdit = { ...post };
    this.showEditorModal = true;
  }

  async quickToggleStatus(post: BlogPost): Promise<void> {
    if (!post.id) return;
    const targetStatus = post.status === 'public' ? 'private' : 'public';
    try {
      await this.firebaseService.updatePost(post.id, { status: targetStatus });
      post.status = targetStatus;
      this.showToast(`Post "${post.title}" is now ${targetStatus}.`);
    } catch (err: any) {
      this.errorMsg = err?.message || 'Could not change status.';
    }
  }

  promptDelete(post: BlogPost): void {
    this.postToDelete = post;
  }

  async confirmDeleteSingle(): Promise<void> {
    if (!this.postToDelete || !this.postToDelete.id) return;
    const id = this.postToDelete.id;
    this.isLoading = true;
    try {
      await this.firebaseService.deletePost(id);
      this.showToast(`Deleted "${this.postToDelete.title}".`);
      this.postToDelete = null;
      await this.loadPosts();
    } catch (err: any) {
      this.errorMsg = err?.message || 'Failed to delete post.';
    } finally {
      this.isLoading = false;
    }
  }

  onEditorSaved(savedPost: BlogPost): void {
    this.showToast(`Saved article: "${savedPost.title}"`);
    this.loadPosts();
  }

  showToast(msg: string): void {
    this.successMsg = msg;
    setTimeout(() => {
      if (this.successMsg === msg) {
        this.successMsg = '';
      }
    }, 4500);
  }

  isScheduledPost(post: BlogPost): boolean {
    const timeStr = post.scheduledDate || post.scheduledAt;
    if (!timeStr) return false;
    const target = new Date(timeStr).getTime();
    return !isNaN(target) && target > Date.now();
  }

  formatDate(isoStr?: string): string {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return isoStr;
    }
  }

  // --- Author Approvals Management ---

  get pendingUsersCount(): number {
    return this.usersList.filter((u) => u.status === 'pending' || (!u.approved && u.role !== 'admin')).length;
  }

  async loadUsers(): Promise<void> {
    if (!this.authService.isAdmin) return;
    this.isLoadingUsers = true;
    try {
      this.usersList = await this.firebaseService.getAllUsers();
    } catch (err: any) {
      console.error('Failed to load users:', err);
    } finally {
      this.isLoadingUsers = false;
    }
  }

  async approveUser(user: UserProfile): Promise<void> {
    this.isLoading = true;
    try {
      await this.firebaseService.setUserApproval(user.uid, true);
      user.approved = true;
      user.status = 'approved';
      this.showToast(`Approved author ${user.displayName || user.email}. They can now create and edit blog posts.`);
    } catch (err: any) {
      this.errorMsg = err?.message || 'Failed to approve author.';
    } finally {
      this.isLoading = false;
    }
  }

  async revokeUser(user: UserProfile): Promise<void> {
    this.isLoading = true;
    try {
      await this.firebaseService.setUserApproval(user.uid, false);
      user.approved = false;
      user.status = 'rejected';
      this.showToast(`Revoked author posting permissions for ${user.displayName || user.email}.`);
    } catch (err: any) {
      this.errorMsg = err?.message || 'Failed to revoke author.';
    } finally {
      this.isLoading = false;
    }
  }
}
