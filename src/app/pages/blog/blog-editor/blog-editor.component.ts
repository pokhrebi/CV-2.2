import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BlogPost, SocialLink, SourceLink } from '../../../core/models/blog.model';
import { FirebaseService } from '../../../core/services/firebase.service';

@Component({
  selector: 'app-blog-editor',
  templateUrl: './blog-editor.component.html'
})
export class BlogEditorComponent implements OnInit {
  @Input() postToEdit: BlogPost | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<BlogPost>();

  isEditMode = false;
  isLoading = false;
  errorMsg = '';

  get isApprovedAuthor(): boolean {
    return this.firebaseService.isAdmin() || this.firebaseService.isApprovedAuthor();
  }

  // Core Form Fields (Title, Body/Content, Status)
  title = '';
  description = '';
  content = '';
  get body(): string {
    return this.content;
  }
  set body(val: string) {
    this.content = val;
  }
  status: 'public' | 'private' = 'public';

  // Image & Firebase Storage State
  imageUrl = '';
  selectedFileName = '';
  isUploadingImage = false;
  uploadProgress = 0;
  uploadError = '';
  isDraggingOver = false;

  // Scheduling & Multi-Tenancy
  isScheduled = false;
  scheduledAt = '';
  tenantId = 'default';

  // Citations & Social Links
  sourceLinks: SourceLink[] = [];
  newSourceTitle = '';
  newSourceUrl = '';

  socialLinks: SocialLink[] = [];
  newSocialPlatform = 'X (Twitter)';
  newSocialUrl = '';

  // Google AdSense Monetization & Dynamic In-Article Ad Settings
  showAds: boolean = true;
  adSlotId: string = '';
  bottomAdSlotId: string = '';

  // Quick Preset Sample Images for One-Click Photography
  sampleImages = [
    { label: 'Architecture', url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Cloud Systems', url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Engineering Code', url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Minimal Studio', url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80' },
    { label: 'Mobile Design', url: 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?auto=format&fit=crop&w=1200&q=80' }
  ];

  socialPlatformOptions = [
    'X (Twitter)',
    'LinkedIn',
    'GitHub',
    'Substack',
    'Medium',
    'YouTube',
    'Website'
  ];

  activeTab: 'edit' | 'preview' = 'edit';

  constructor(public firebaseService: FirebaseService) {}

  ngOnInit(): void {
    if (this.postToEdit) {
      this.isEditMode = true;
      this.title = this.postToEdit.title || '';
      this.description = this.postToEdit.description || '';
      this.content = this.postToEdit.content || this.postToEdit.body || '';
      this.imageUrl = this.postToEdit.imageUrl || '';
      this.status = this.postToEdit.status || 'public';
      this.tenantId = this.postToEdit.tenantId || this.firebaseService.activeTenant || 'default';
      this.sourceLinks = this.postToEdit.sourceLinks ? [...this.postToEdit.sourceLinks] : [];
      this.socialLinks = this.postToEdit.socialLinks ? [...this.postToEdit.socialLinks] : [];
      this.showAds = this.postToEdit.showAds !== false;
      this.adSlotId = this.postToEdit.adSlotId || '';
      this.bottomAdSlotId = this.postToEdit.bottomAdSlotId || '';

      const scheduleTime = this.postToEdit.scheduledDate || this.postToEdit.scheduledAt;
      if (scheduleTime) {
        this.isScheduled = true;
        try {
          const d = new Date(scheduleTime);
          if (!isNaN(d.getTime())) {
            this.scheduledAt = d.toISOString().slice(0, 16);
          }
        } catch {
          this.scheduledAt = '';
        }
      }
    } else {
      this.tenantId = this.firebaseService.activeTenant || 'default';
      this.imageUrl = this.sampleImages[2].url;
      this.showAds = true;
      this.adSlotId = '';
      this.bottomAdSlotId = '';
    }
  }

  // --- Firebase Storage File Selection & Upload ---

  onFileInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.processFile(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDraggingOver = false;

    if (event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      this.processFile(file);
    }
  }

  private async processFile(file: File): Promise<void> {
    if (!file.type.startsWith('image/')) {
      this.uploadError = 'Please select a valid image file (PNG, JPEG, WebP, GIF, SVG).';
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      this.uploadError = 'Image exceeds the maximum allowed size of 15MB.';
      return;
    }

    this.selectedFileName = file.name;
    this.uploadError = '';
    this.isUploadingImage = true;
    this.uploadProgress = 20;

    // Instant local preview
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result && !this.imageUrl) {
        this.imageUrl = e.target.result as string;
      }
    };
    reader.readAsDataURL(file);

    try {
      const finalUrl = await this.firebaseService.uploadPostImage(file, (percent) => {
        this.uploadProgress = percent;
      });
      if (finalUrl) {
        this.imageUrl = finalUrl;
      }
      this.uploadProgress = 100;
    } catch (err: any) {
      console.warn('Image processing completed with fallback:', err);
    } finally {
      this.isUploadingImage = false;
    }
  }

  selectSampleImage(url: string): void {
    this.imageUrl = url;
    this.selectedFileName = '';
    this.uploadError = '';
  }

  clearImage(): void {
    this.imageUrl = '';
    this.selectedFileName = '';
    this.uploadProgress = 0;
    this.uploadError = '';
  }

  // --- Citations & Social Links ---

  addSourceLink(): void {
    if (!this.newSourceUrl.trim()) return;
    const url = this.newSourceUrl.trim();
    const title = this.newSourceTitle.trim() || this.extractDomain(url);
    this.sourceLinks.push({ title, url });
    this.newSourceTitle = '';
    this.newSourceUrl = '';
  }

  removeSourceLink(index: number): void {
    this.sourceLinks.splice(index, 1);
  }

  addSocialLink(): void {
    if (!this.newSocialUrl.trim()) return;
    this.socialLinks.push({
      platform: this.newSocialPlatform,
      url: this.newSocialUrl.trim()
    });
    this.newSocialUrl = '';
  }

  removeSocialLink(index: number): void {
    this.socialLinks.splice(index, 1);
  }

  extractDomain(url: string): string {
    try {
      const u = new URL(url.startsWith('http') ? url : `https://${url}`);
      return u.hostname.replace('www.', '');
    } catch {
      return url;
    }
  }

  // --- Save / Update Post ---

  async savePost(): Promise<void> {
    if (!this.firebaseService.currentUser) {
      this.errorMsg = 'Please sign in with your author account before saving or publishing an article.';
      return;
    }

    if (!this.title.trim()) {
      this.errorMsg = 'Please enter a title for the blog post.';
      return;
    }

    if (!this.content.trim()) {
      this.errorMsg = 'Please provide the article body content.';
      return;
    }

    if (this.isScheduled && !this.scheduledAt) {
      this.errorMsg = 'Please specify a scheduled publication date & time.';
      return;
    }

    if (this.isUploadingImage && !this.imageUrl) {
      this.errorMsg = 'Please wait for image preview to finish loading.';
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';

    const resolvedSchedule = this.isScheduled && this.scheduledAt ? new Date(this.scheduledAt).toISOString() : '';

    const payload: Partial<BlogPost> = {
      tenantId: this.tenantId.trim() || 'default',
      title: this.title.trim(),
      description: this.description.trim(),
      content: this.content.trim(),
      body: this.content.trim(),
      imageUrl: this.imageUrl.trim(),
      status: this.status,
      scheduledAt: resolvedSchedule,
      scheduledDate: resolvedSchedule,
      sourceLinks: this.sourceLinks,
      socialLinks: this.socialLinks,
      showAds: this.showAds,
      adSlotId: this.adSlotId.trim() || undefined,
      bottomAdSlotId: this.bottomAdSlotId.trim() || undefined
    };

    try {
      if (this.isEditMode && this.postToEdit && this.postToEdit.id) {
        await this.firebaseService.updatePost(this.postToEdit.id, payload);
        const updatedPost: BlogPost = {
          ...this.postToEdit,
          ...payload
        } as BlogPost;
        this.saved.emit(updatedPost);
      } else {
        const id = await this.firebaseService.createPost(payload as any);
        const newPost: BlogPost = {
          id,
          ...payload,
          authorId: this.firebaseService.currentUser?.uid || '',
          createdAt: new Date().toISOString()
        } as BlogPost;
        this.saved.emit(newPost);
      }
      this.close.emit();
    } catch (err: any) {
      console.error('Error saving blog post:', err);
      this.errorMsg = err?.message || 'Could not save post. Please check permissions.';
    } finally {
      this.isLoading = false;
    }
  }

  getPreviewSegments(): { type: string; text?: string; codeLang?: string }[] {
    if (!this.content) return [];
    const segments: { type: string; text?: string; codeLang?: string }[] = [];
    const lines = this.content.split('\n');
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
          segments.push({ type: 'code', text: currentCode.join('\n'), codeLang: codeLanguage });
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

    if (!this.showAds) return segments;

    const paragraphIndices: number[] = [];
    for (let i = 0; i < segments.length; i++) {
      if (segments[i].type === 'paragraph') paragraphIndices.push(i);
    }
    if (paragraphIndices.length >= 3) {
      const targetP = Math.min(2, paragraphIndices.length - 1);
      const result = [...segments];
      result.splice(paragraphIndices[targetP] + 1, 0, { type: 'ad' });
      return result;
    }
    return segments;
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('editor-modal-backdrop')) {
      this.close.emit();
    }
  }
}
