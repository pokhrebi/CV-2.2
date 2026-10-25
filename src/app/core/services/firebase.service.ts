import { Injectable } from '@angular/core';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  User,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  getDocFromServer
} from 'firebase/firestore';
import {
  getStorage,
  FirebaseStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  UploadTaskSnapshot
} from 'firebase/storage';
import { BehaviorSubject, Observable } from 'rxjs';
import { BlogPost, UserProfile, ArticleComment, ArticleVote } from '../models/blog.model';
import { BASELINE_POSTS, BASELINE_COMMENTS } from '../models/baseline-posts';

export const ADMIN_EMAILS = [
  'hamroghar106@gmail.com',
  'bhaktipokhrel2004@gmail.com'
];

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

const FIREBASE_CONFIG = {
  projectId: "project-6c6397b8-aa35-4167-ba7",
  appId: "1:341306938303:web:4eae16747497c7ce96870a",
  apiKey: "AIzaSyCaGmUhMpbIGvVHhihe8BlS1NXzDzHcjPc",
  authDomain: "project-6c6397b8-aa35-4167-ba7.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-cv22-90648d4e-c5d9-451b-814f-b86c5beaa0e9",
  storageBucket: "project-6c6397b8-aa35-4167-ba7.firebasestorage.app",
  messagingSenderId: "341306938303",
  measurementId: "",
  oAuthClientId: "341306938303-7jmpsn18q42tp68ah1188u50bqi7l0qq.apps.googleusercontent.com"
};

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private app: FirebaseApp;
  public auth: Auth;
  public db: Firestore;
  private storage: FirebaseStorage;

  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  private activeTenantSubject = new BehaviorSubject<string>('default');
  public activeTenant$: Observable<string> = this.activeTenantSubject.asObservable();

  private userProfileSubject = new BehaviorSubject<UserProfile | null>(null);
  public userProfile$: Observable<UserProfile | null> = this.userProfileSubject.asObservable();

  private localVotesCache = new Map<string, 1 | -1 | 0>();
  private localPostScores = new Map<string, { upvotes: number; downvotes: number; score: number }>();
  private localCommentsCache = new Map<string, ArticleComment[]>();

  constructor() {
    this.app = getApps().length ? getApp() : initializeApp(FIREBASE_CONFIG);
    this.auth = getAuth(this.app);
    // Initialize Firestore with custom databaseId if configured
    this.db = FIREBASE_CONFIG.firestoreDatabaseId
      ? getFirestore(this.app, FIREBASE_CONFIG.firestoreDatabaseId)
      : getFirestore(this.app);

    // Initialize Firebase Storage
    this.storage = getStorage(this.app);

    onAuthStateChanged(this.auth, async (user) => {
      this.currentUserSubject.next(user);
      if (user) {
        try {
          const profile = await this.syncUserProfile(user);
          this.userProfileSubject.next(profile);
        } catch (err) {
          console.warn('Could not sync user profile on auth change:', err);
        }
      } else {
        this.userProfileSubject.next(null);
      }
    });

    this.testConnection();
  }

  public get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  public get userProfile(): UserProfile | null {
    return this.userProfileSubject.value;
  }

  public isAdmin(user?: User | null): boolean {
    const u = user || this.currentUser;
    if (!u || !u.email) return false;
    return ADMIN_EMAILS.includes(u.email.toLowerCase());
  }

  public isApprovedAuthor(): boolean {
    if (this.isAdmin()) return true;
    const profile = this.userProfileSubject.value;
    if (profile && (profile.approved === true || profile.status === 'approved' || profile.role === 'admin')) {
      return true;
    }
    // Any authenticated user is granted author writing privileges
    return !!this.currentUser;
  }

  public async syncUserProfile(user: User): Promise<UserProfile> {
    const path = `users/${user.uid}`;
    try {
      const userDocRef = doc(this.db, 'users', user.uid);
      const snap = await getDoc(userDocRef);
      const isAdminUser = this.isAdmin(user);

      if (!snap.exists()) {
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || user.email?.split('@')[0] || 'Author',
          photoURL: user.photoURL || '',
          role: isAdminUser ? 'admin' : 'author',
          status: isAdminUser ? 'approved' : 'pending',
          approved: isAdminUser,
          createdAt: new Date().toISOString()
        };
        await setDoc(userDocRef, newProfile);
        return newProfile;
      } else {
        const data = snap.data() as UserProfile;
        // Auto-promote configured admin if needed
        if (isAdminUser && (!data.approved || data.role !== 'admin' || data.status !== 'approved')) {
          const updated = { ...data, role: 'admin' as const, approved: true, status: 'approved' as const };
          await updateDoc(userDocRef, { role: 'admin', approved: true, status: 'approved' });
          return updated;
        }
        return data;
      }
    } catch (err) {
      console.warn('Profile sync error in Firestore:', err);
      // Fallback in-memory profile
      const isAdminUser = this.isAdmin(user);
      return {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || user.email?.split('@')[0] || 'Author',
        photoURL: user.photoURL || '',
        role: isAdminUser ? 'admin' : 'author',
        status: isAdminUser ? 'approved' : 'pending',
        approved: isAdminUser,
        createdAt: new Date().toISOString()
      };
    }
  }

  public async getAllUsers(): Promise<UserProfile[]> {
    if (!this.isAdmin()) {
      return [];
    }
    const path = 'users';
    try {
      const snap = await getDocs(collection(this.db, 'users'));
      const list: UserProfile[] = [];
      snap.forEach((d) => {
        list.push(d.data() as UserProfile);
      });
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return list;
    } catch (error) {
      console.error('Failed to get users:', error);
      return [];
    }
  }

  public async setUserApproval(uid: string, approved: boolean): Promise<void> {
    if (!this.isAdmin()) {
      throw new Error('Only the administrator can approve new authors.');
    }
    const path = `users/${uid}`;
    try {
      const userRef = doc(this.db, 'users', uid);
      const status = approved ? 'approved' : 'rejected';
      await updateDoc(userRef, {
        approved,
        status,
        approvedAt: approved ? new Date().toISOString() : null,
        approvedBy: this.currentUser?.email || 'admin'
      });
    } catch (error) {
      this.handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  public get activeTenant(): string {
    return this.activeTenantSubject.value;
  }

  public setActiveTenant(tenantId: string): void {
    this.activeTenantSubject.next(tenantId.trim() || 'default');
  }

  // --- Firebase Storage & Image Optimization ---

  public async uploadPostImage(file: File, onProgress?: (percent: number) => void): Promise<string> {
    const user = this.currentUser;
    if (!user) {
      throw new Error('Authentication required to upload post images.');
    }

    if (!file.type.startsWith('image/')) {
      throw new Error('Selected file must be an image (PNG, JPEG, WebP, GIF, SVG).');
    }

    // 1. Immediately create a fast, compressed Data URL (< 150KB, max 1200px)
    if (onProgress) onProgress(35);
    const compressedDataUrl = await this.compressImage(file);
    if (onProgress) onProgress(65);

    // 2. Race Firebase Storage upload with a 3.5-second timeout
    try {
      const storageUrl = await Promise.race([
        this.uploadToStorage(file, user.uid, onProgress),
        new Promise<string>((_, reject) =>
          setTimeout(() => reject(new Error('Storage timeout - fallback to compressed image')), 3500)
        )
      ]);
      if (onProgress) onProgress(100);
      return storageUrl;
    } catch (storageErr) {
      console.warn('Storage upload bypassed or timed out, using compressed inline image:', storageErr);
      if (onProgress) onProgress(100);
      return compressedDataUrl || '';
    }
  }

  private compressImage(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (!result) return resolve('');

        const img = new Image();
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const maxDim = 1200;

            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.drawImage(img, 0, 0, width, height);
              try {
                const webpUrl = canvas.toDataURL('image/webp', 0.82);
                if (webpUrl && webpUrl.startsWith('data:image/webp')) {
                  return resolve(webpUrl);
                }
              } catch {}
              return resolve(canvas.toDataURL('image/jpeg', 0.82));
            }
          } catch (canvasErr) {
            console.warn('Canvas compression error:', canvasErr);
          }
          resolve(result);
        };
        img.onerror = () => resolve(result);
        img.src = result;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  }

  private uploadToStorage(file: File, uid: string, onProgress?: (percent: number) => void): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      try {
        const cleanFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const storagePath = `blog-images/${uid}/${Date.now()}-${cleanFilename}`;
        const storageRef = ref(this.storage, storagePath);
        const uploadTask = uploadBytesResumable(storageRef, file, { contentType: file.type });

        uploadTask.on(
          'state_changed',
          (snapshot: UploadTaskSnapshot) => {
            const progress = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
            if (onProgress) onProgress(progress);
          },
          (error) => reject(error),
          async () => {
            try {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadUrl);
            } catch (err) {
              reject(err);
            }
          }
        );
      } catch (err) {
        reject(err);
      }
    });
  }

  private async testConnection(): Promise<void> {
    try {
      await getDocFromServer(doc(this.db, 'test', 'connection'));
    } catch (error) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration.");
      }
    }
  }

  private handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
    const errInfo: FirestoreErrorInfo = {
      error: error instanceof Error ? error.message : String(error),
      authInfo: {
        userId: this.auth.currentUser?.uid,
        email: this.auth.currentUser?.email,
        emailVerified: this.auth.currentUser?.emailVerified,
        isAnonymous: this.auth.currentUser?.isAnonymous,
        tenantId: this.auth.currentUser?.tenantId,
        providerInfo: this.auth.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || []
      },
      operationType,
      path
    };
    console.error('Firestore Error: ', JSON.stringify(errInfo));
    throw new Error(JSON.stringify(errInfo));
  }

  // --- Authentication ---

  public async signInWithGoogle(): Promise<User> {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);
      return result.user;
    } catch (err) {
      console.error('Error signing in with Google:', err);
      throw err;
    }
  }

  public async signInWithEmail(email: string, pass: string): Promise<User> {
    try {
      const cred = await signInWithEmailAndPassword(this.auth, email, pass);
      return cred.user;
    } catch (err) {
      console.error('Error signing in with Email:', err);
      throw err;
    }
  }

  public async registerWithEmail(email: string, pass: string): Promise<User> {
    try {
      const cred = await createUserWithEmailAndPassword(this.auth, email, pass);
      return cred.user;
    } catch (err) {
      console.error('Error registering with Email:', err);
      throw err;
    }
  }

  public async logOut(): Promise<void> {
    await signOut(this.auth);
  }

  // --- Blog CRUD (Multi-Tenant Ready) ---

  public async getPosts(tenantId?: string): Promise<BlogPost[]> {
    const path = 'posts';
    try {
      const postsMap = new Map<string, BlogPost>();

      // 1. Query all public posts (satisfies rule: resource.data.status == 'public')
      const publicQuery = query(
        collection(this.db, path),
        where('status', '==', 'public')
      );
      const publicSnap = await getDocs(publicQuery);
      publicSnap.forEach((docSnap) => {
        postsMap.set(docSnap.id, {
          ...(docSnap.data() as BlogPost),
          id: docSnap.id
        });
      });

      // 2. If a user is signed in, also query their own posts (both public and private drafts)
      // Satisfies rule: (isSignedIn() && resource.data.authorId == request.auth.uid)
      const currentUser = this.auth.currentUser;
      if (currentUser) {
        try {
          const userQuery = query(
            collection(this.db, path),
            where('authorId', '==', currentUser.uid)
          );
          const userSnap = await getDocs(userQuery);
          userSnap.forEach((docSnap) => {
            postsMap.set(docSnap.id, {
              ...(docSnap.data() as BlogPost),
              id: docSnap.id
            });
          });
        } catch (authErr) {
          console.warn('Could not query author-specific drafts:', authErr);
        }
      }

      // 3. Ensure baseline high-value architectural articles are available for readers & AdSense
      BASELINE_POSTS.forEach((bp) => {
        if (!postsMap.has(bp.id!)) {
          postsMap.set(bp.id!, bp);
        }
      });

      const allPosts = Array.from(postsMap.values()).map(p => {
        if (p.id && this.localPostScores.has(p.id)) {
          return { ...p, ...this.localPostScores.get(p.id) };
        }
        return p;
      });

      // Filter by tenantId if provided (defaults to active tenant if not 'all')
      const targetTenant = tenantId || this.activeTenant;
      const filtered = targetTenant === 'all'
        ? allPosts
        : allPosts.filter(p => !p.tenantId || p.tenantId === targetTenant);

      // Sort newest first
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return filtered;
    } catch (error) {
      console.warn('Firestore posts query returned error, serving baseline dispatches:', error);
      return BASELINE_POSTS.map(p => {
        if (p.id && this.localPostScores.has(p.id)) {
          return { ...p, ...this.localPostScores.get(p.id) };
        }
        return p;
      });
    }
  }

  public async getPost(id: string): Promise<BlogPost | null> {
    const path = `posts/${id}`;
    let result: BlogPost | null = null;
    try {
      const docRef = doc(this.db, 'posts', id);
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        const baseline = BASELINE_POSTS.find(p => p.id === id);
        result = baseline || null;
      } else {
        result = { ...(snap.data() as BlogPost), id: snap.id };
      }
    } catch (error) {
      const baseline = BASELINE_POSTS.find(p => p.id === id);
      if (baseline) {
        result = baseline;
      } else {
        this.handleFirestoreError(error, OperationType.GET, path);
      }
    }

    if (result && result.id && this.localPostScores.has(result.id)) {
      result = { ...result, ...this.localPostScores.get(result.id) };
    }
    return result;
  }

  public async createPost(post: Omit<BlogPost, 'id' | 'authorId' | 'createdAt'>): Promise<string> {
    const currentUser = this.currentUser;
    if (!currentUser) {
      throw new Error('You must be logged in to create a blog post.');
    }

    if (!this.isAdmin(currentUser) && !this.isApprovedAuthor()) {
      throw new Error('Your account is pending administrator approval. An administrator must approve your account before you can write articles.');
    }

    const postId = 'post-' + Date.now() + '-' + Math.random().toString(36).substring(2, 8);
    const path = `posts/${postId}`;

    const postContent = (post.content || post.body || '').trim();
    const scheduleTime = post.scheduledDate || post.scheduledAt || '';

    const newPostData: BlogPost = {
      tenantId: (post.tenantId || this.activeTenant || 'default').trim(),
      title: post.title.trim(),
      description: post.description ? post.description.trim() : '',
      content: postContent,
      body: postContent,
      imageUrl: post.imageUrl ? post.imageUrl.trim() : 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80',
      status: (post.status as any) || 'public',
      showAds: true,
      upvotesCount: 0,
      downvotesCount: 0,
      score: 0,
      commentsCount: 0,
      scheduledAt: scheduleTime,
      scheduledDate: scheduleTime,
      sourceLinks: post.sourceLinks || [],
      socialLinks: post.socialLinks || [],
      authorId: currentUser.uid,
      authorName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Author',
      authorEmail: currentUser.email || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      const docRef = doc(this.db, 'posts', postId);
      await setDoc(docRef, newPostData);
      return postId;
    } catch (error) {
      this.handleFirestoreError(error, OperationType.CREATE, path);
    }
  }

  public async updatePost(id: string, updates: Partial<BlogPost>): Promise<void> {
    const currentUser = this.currentUser;
    if (!currentUser) {
      throw new Error('You must be logged in to update a post.');
    }

    if (!this.isAdmin(currentUser) && !this.isApprovedAuthor()) {
      throw new Error('Your account is pending administrator approval. An administrator must approve your account before you can edit articles.');
    }

    const path = `posts/${id}`;
    try {
      const docRef = doc(this.db, 'posts', id);
      const existingSnap = await getDoc(docRef);
      if (!existingSnap.exists()) {
        throw new Error('Post not found');
      }

      const existingData = existingSnap.data() as BlogPost;
      const resolvedContent = updates.content !== undefined 
        ? updates.content.trim() 
        : (updates.body !== undefined ? updates.body.trim() : existingData.content);
      const resolvedSchedule = updates.scheduledDate !== undefined 
        ? updates.scheduledDate 
        : (updates.scheduledAt !== undefined ? updates.scheduledAt : (existingData.scheduledAt || ''));

      const updatedPayload: Record<string, any> = {
        title: updates.title !== undefined ? updates.title.trim() : existingData.title,
        description: updates.description !== undefined ? updates.description.trim() : existingData.description || '',
        content: resolvedContent,
        body: resolvedContent,
        imageUrl: updates.imageUrl !== undefined ? updates.imageUrl.trim() : existingData.imageUrl || '',
        status: updates.status !== undefined ? updates.status : existingData.status,
        scheduledAt: resolvedSchedule,
        scheduledDate: resolvedSchedule,
        sourceLinks: updates.sourceLinks !== undefined ? updates.sourceLinks : (existingData.sourceLinks || []),
        socialLinks: updates.socialLinks !== undefined ? updates.socialLinks : (existingData.socialLinks || []),
        tenantId: existingData.tenantId, // Immutable
        authorId: existingData.authorId, // Immutable
        createdAt: existingData.createdAt, // Immutable
        updatedAt: new Date().toISOString()
      };

      await updateDoc(docRef, updatedPayload);
    } catch (error) {
      this.handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  public async deletePost(id: string): Promise<void> {
    const currentUser = this.currentUser;
    if (!currentUser) {
      throw new Error('You must be logged in to delete a post.');
    }

    const path = `posts/${id}`;
    try {
      const docRef = doc(this.db, 'posts', id);
      await deleteDoc(docRef);
    } catch (error) {
      this.handleFirestoreError(error, OperationType.DELETE, path);
    }
  }

  // --- Article Ranking & Up/Down Voting System (Strictly Authenticated) ---

  public async getUserVote(postId: string): Promise<1 | -1 | 0> {
    const user = this.currentUser;
    if (!user) return 0;

    const cacheKey = `${postId}_${user.uid}`;
    if (this.localVotesCache.has(cacheKey)) {
      return this.localVotesCache.get(cacheKey)!;
    }

    try {
      const voteDocRef = doc(this.db, 'posts', postId, 'votes', user.uid);
      const snap = await getDoc(voteDocRef);
      if (snap.exists()) {
        const val = snap.data()?.['vote'] as (1 | -1);
        this.localVotesCache.set(cacheKey, val);
        return val;
      }
    } catch (err) {
      console.warn('Could not read user vote from Firestore:', err);
    }
    return 0;
  }

  public async voteArticle(postId: string, direction: 'up' | 'down'): Promise<{ userVote: 1 | -1 | 0; score: number; upvotes: number; downvotes: number }> {
    const user = this.currentUser;
    if (!user) {
      throw new Error('Authentication required. Only signed-in users can upvote or downvote articles.');
    }

    const currentVote = await this.getUserVote(postId);
    const targetVote: 1 | -1 = direction === 'up' ? 1 : -1;
    let newVote: 1 | -1 | 0 = 0;

    // Toggle off if clicking the same direction again
    if (currentVote === targetVote) {
      newVote = 0;
    } else {
      newVote = targetVote;
    }

    const cacheKey = `${postId}_${user.uid}`;
    this.localVotesCache.set(cacheKey, newVote);

    // Fetch baseline / current post stats
    const post = await this.getPost(postId);
    let upvotes = post?.upvotesCount ?? (post?.score && post.score > 0 ? post.score : 0);
    let downvotes = post?.downvotesCount ?? 0;

    // Apply delta from currentVote to newVote
    if (currentVote === 1) {
      upvotes = Math.max(0, upvotes - 1);
    } else if (currentVote === -1) {
      downvotes = Math.max(0, downvotes - 1);
    }

    if (newVote === 1) {
      upvotes += 1;
    } else if (newVote === -1) {
      downvotes += 1;
    }

    const score = upvotes - downvotes;
    this.localPostScores.set(postId, { upvotes, downvotes, score });

    // Update in Firestore
    try {
      const voteDocRef = doc(this.db, 'posts', postId, 'votes', user.uid);
      if (newVote === 0) {
        await deleteDoc(voteDocRef);
      } else {
        const votePayload: ArticleVote = {
          postId,
          userId: user.uid,
          vote: newVote,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        await setDoc(voteDocRef, votePayload);
      }

      // Update counters on post document if post is in Firestore
      const postRef = doc(this.db, 'posts', postId);
      await updateDoc(postRef, {
        upvotesCount: upvotes,
        downvotesCount: downvotes,
        score,
        updatedAt: new Date().toISOString()
      }).catch(err => {
        console.warn('Post stats counter update bypassed for offline/baseline dispatch:', err);
      });
    } catch (err) {
      console.warn('Firestore vote persistence bypassed, maintained in active session:', err);
    }

    return { userVote: newVote, score, upvotes, downvotes };
  }

  // --- Article Comments System (Strictly Authenticated) ---

  public async getComments(postId: string): Promise<ArticleComment[]> {
    const commentsList: ArticleComment[] = [];
    const seenIds = new Set<string>();

    try {
      const commentsColl = collection(this.db, 'posts', postId, 'comments');
      const snap = await getDocs(query(commentsColl, orderBy('createdAt', 'asc')));
      snap.forEach((d) => {
        const data = d.data() as ArticleComment;
        seenIds.add(data.id || d.id);
        commentsList.push({ ...data, id: data.id || d.id });
      });
    } catch (err) {
      console.warn('Could not read comments from Firestore, serving community comments:', err);
    }

    // Include baseline community comments if any
    const baseline = BASELINE_COMMENTS[postId] || [];
    baseline.forEach((c) => {
      if (!seenIds.has(c.id)) {
        seenIds.add(c.id);
        commentsList.push(c);
      }
    });

    // Also include any local comments in session cache
    const local = this.localCommentsCache.get(postId) || [];
    local.forEach((c) => {
      if (!seenIds.has(c.id)) {
        seenIds.add(c.id);
        commentsList.push(c);
      }
    });

    // Sort chronologically ascending
    commentsList.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    return commentsList;
  }

  public async addComment(postId: string, content: string): Promise<ArticleComment> {
    const user = this.currentUser;
    if (!user) {
      throw new Error('Authentication required. Only signed-in users can comment on articles.');
    }

    const clean = content.trim();
    if (!clean) {
      throw new Error('Comment text cannot be empty.');
    }
    if (clean.length > 2000) {
      throw new Error('Comment cannot exceed 2000 characters.');
    }

    const commentId = 'comm-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);
    const newComment: ArticleComment = {
      id: commentId,
      postId,
      authorId: user.uid,
      authorName: user.displayName || user.email?.split('@')[0] || 'Community Member',
      authorEmail: user.email || '',
      authorPhotoUrl: user.photoURL || '',
      content: clean,
      createdAt: new Date().toISOString()
    };

    // Cache locally
    const currentList = this.localCommentsCache.get(postId) || [];
    currentList.push(newComment);
    this.localCommentsCache.set(postId, currentList);

    // Persist to Firestore
    try {
      const commentDocRef = doc(this.db, 'posts', postId, 'comments', commentId);
      await setDoc(commentDocRef, newComment);

      // Increment comments count on post
      const postRef = doc(this.db, 'posts', postId);
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        const postData = postSnap.data() as BlogPost;
        const currentCount = postData.commentsCount || 0;
        await updateDoc(postRef, {
          commentsCount: currentCount + 1,
          updatedAt: new Date().toISOString()
        }).catch(() => {});
      }
    } catch (err) {
      console.warn('Comment Firestore write bypassed, cached locally:', err);
    }

    return newComment;
  }

  public async deleteComment(postId: string, commentId: string): Promise<void> {
    const user = this.currentUser;
    if (!user) {
      throw new Error('Authentication required.');
    }

    // Remove from local cache
    const currentList = this.localCommentsCache.get(postId) || [];
    this.localCommentsCache.set(postId, currentList.filter(c => c.id !== commentId));

    try {
      const commentDocRef = doc(this.db, 'posts', postId, 'comments', commentId);
      await deleteDoc(commentDocRef);

      // Decrement count on post if exists
      const postRef = doc(this.db, 'posts', postId);
      const postSnap = await getDoc(postRef);
      if (postSnap.exists()) {
        const postData = postSnap.data() as BlogPost;
        const currentCount = Math.max(0, (postData.commentsCount || 1) - 1);
        await updateDoc(postRef, {
          commentsCount: currentCount,
          updatedAt: new Date().toISOString()
        }).catch(() => {});
      }
    } catch (err) {
      console.warn('Comment delete bypassed in Firestore:', err);
    }
  }
}

