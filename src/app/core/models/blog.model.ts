export interface SourceLink {
  title: string;
  url: string;
}

export interface SocialLink {
  platform: string;
  url: string;
}

export interface BlogPost {
  id?: string;
  tenantId: string;
  title: string;
  description?: string;
  body?: string; // Main blog post body content
  content: string; // Markdown or formatted text content
  imageUrl?: string; // Single featured header image
  status: 'public' | 'private';
  scheduledDate?: string; // Target ISO date/timestamp to go public
  scheduledAt?: string; // ISO date/timestamp alias
  sourceLinks?: SourceLink[];
  socialLinks?: SocialLink[];
  showAds?: boolean; // Controls whether Google AdSense in-article & banner units are dynamically rendered
  adSlotId?: string; // Optional custom AdSense slot ID for in-article ad
  bottomAdSlotId?: string; // Optional custom AdSense slot ID for bottom ad
  upvotesCount?: number; // Total up arrow votes
  downvotesCount?: number; // Total down arrow votes
  score?: number; // Aggregate rank score (upvotes - downvotes)
  commentsCount?: number; // Total comments count
  authorId: string;
  authorName?: string;
  authorEmail?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ArticleComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorEmail?: string;
  authorPhotoUrl?: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ArticleVote {
  postId: string;
  userId: string;
  vote: 1 | -1;
  createdAt: string;
  updatedAt?: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'admin' | 'author' | 'reader';
  status: 'pending' | 'approved' | 'rejected';
  approved: boolean;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

