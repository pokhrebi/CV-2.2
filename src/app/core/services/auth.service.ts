import { Injectable } from '@angular/core';
import {
  getAuth,
  Auth,
  User,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
  IdTokenResult
} from 'firebase/auth';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { FirebaseService } from './firebase.service';

export interface UserSession {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  isAdmin: boolean;
  token?: string;
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
export class AuthService {
  private app: FirebaseApp;
  private auth: Auth;

  // Session State Subjects
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$: Observable<User | null> = this.currentUserSubject.asObservable();

  private isLoadedSubject = new BehaviorSubject<boolean>(false);
  public isLoaded$: Observable<boolean> = this.isLoadedSubject.asObservable();

  private isAdminSubject = new BehaviorSubject<boolean>(false);
  public isAdmin$: Observable<boolean> = this.isAdminSubject.asObservable();

  private showAuthModalSubject = new BehaviorSubject<boolean>(false);
  public showAuthModal$: Observable<boolean> = this.showAuthModalSubject.asObservable();

  public openAuthModal(): void {
    this.showAuthModalSubject.next(true);
  }

  public closeAuthModal(): void {
    this.showAuthModalSubject.next(false);
  }

  // Derived Observable: Is Authenticated
  public isAuthenticated$: Observable<boolean> = this.currentUser$.pipe(
    map((user) => !!user)
  );

  // Derived Observable: User Session Details
  public session$: Observable<UserSession | null> = this.currentUser$.pipe(
    map((user) => {
      if (!user) return null;
      return {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        emailVerified: user.emailVerified,
        isAdmin: this.checkIsAdmin(user)
      };
    })
  );

  constructor(private firebaseService: FirebaseService) {
    this.auth = this.firebaseService.auth;
    this.app = (this.auth as any).app;

    // Direct synchronization with FirebaseService's single source of truth
    this.firebaseService.currentUser$.subscribe((user) => {
      this.currentUserSubject.next(user);
      this.isAdminSubject.next(this.checkIsAdmin(user));
      this.isLoadedSubject.next(true);
    });
  }

  // --- Synchronous Getters ---

  public get currentUser(): User | null {
    return this.currentUserSubject.value || this.firebaseService.currentUser;
  }

  public get isAuthenticated(): boolean {
    return !!this.currentUser;
  }

  public get isLoaded(): boolean {
    return this.isLoadedSubject.value;
  }

  public get isAdmin(): boolean {
    return this.checkIsAdmin(this.currentUser) || this.firebaseService.isAdmin();
  }

  // --- Authentication Actions ---

  /**
   * One-click Google OAuth Login Popup
   */
  public async signInWithGoogle(): Promise<User> {
    try {
      const user = await this.firebaseService.signInWithGoogle();
      this.currentUserSubject.next(user);
      this.isAdminSubject.next(this.checkIsAdmin(user));
      return user;
    } catch (error: any) {
      console.error('Google Sign-In failed:', error);
      throw new Error(this.formatAuthError(error));
    }
  }

  /**
   * Email and Password Sign-In
   */
  public async signInWithEmail(email: string, pass: string): Promise<User> {
    try {
      const result = await signInWithEmailAndPassword(this.auth, email.trim(), pass);
      return result.user;
    } catch (error: any) {
      console.error('Email Sign-In failed:', error);
      throw new Error(this.formatAuthError(error));
    }
  }

  /**
   * Register a new Author / Admin account with Email and Password
   */
  public async registerWithEmail(email: string, pass: string, displayName?: string): Promise<User> {
    try {
      const result = await createUserWithEmailAndPassword(this.auth, email.trim(), pass);
      if (displayName && displayName.trim()) {
        await updateProfile(result.user, { displayName: displayName.trim() });
        this.currentUserSubject.next(this.auth.currentUser);
      }
      return result.user;
    } catch (error: any) {
      console.error('Email Registration failed:', error);
      throw new Error(this.formatAuthError(error));
    }
  }

  /**
   * Terminate current session and sign out
   */
  public async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
      this.currentUserSubject.next(null);
      this.isAdminSubject.next(false);
    } catch (error: any) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  /**
   * Send Password Reset Email
   */
  public async sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email.trim());
    } catch (error: any) {
      console.error('Password reset error:', error);
      throw new Error(this.formatAuthError(error));
    }
  }

  /**
   * Update Profile Details (Display Name / Avatar URL)
   */
  public async updateProfileInfo(displayName: string, photoURL?: string): Promise<void> {
    const user = this.currentUser;
    if (!user) {
      throw new Error('No authenticated user session found.');
    }

    try {
      await updateProfile(user, {
        displayName: displayName.trim(),
        photoURL: photoURL ? photoURL.trim() : user.photoURL
      });
      this.currentUserSubject.next(this.auth.currentUser);
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw new Error(this.formatAuthError(error));
    }
  }

  /**
   * Retrieve current user's Firebase JWT ID Token for API calls
   */
  public async getIdToken(forceRefresh = false): Promise<string | null> {
    const user = this.currentUser;
    if (!user) return null;
    return await user.getIdToken(forceRefresh);
  }

  /**
   * Refresh current user profile from Firebase
   */
  public async reloadUser(): Promise<void> {
    const user = this.currentUser;
    if (user) {
      await user.reload();
      this.currentUserSubject.next(this.auth.currentUser);
    }
  }

  // --- Helper & Utility Logic ---

  /**
   * Evaluates if current user has Admin privileges for the Blog Admin Panel
   */
  private checkIsAdmin(user: User | null): boolean {
    if (!user || !user.email) return false;
    // Authorized admin emails
    const adminEmails = [
      'hamroghar106@gmail.com',
      'bhaktipokhrel2004@gmail.com'
    ];
    return adminEmails.includes(user.email.toLowerCase());
  }

  /**
   * Formats Firebase error codes into human-readable messages
   */
  public formatAuthError(error: any): string {
    const code = error?.code || '';
    switch (code) {
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password.';
      case 'auth/user-not-found':
        return 'No account found with this email.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Please sign in.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/popup-closed-by-user':
        return 'The Google sign-in popup was closed before completing.';
      case 'auth/popup-blocked':
        return 'The sign-in popup was blocked by your browser. Please allow popups for this site, or open the link directly.';
      case 'auth/operation-not-allowed':
        return 'Email/password sign-in is disabled in your Firebase console. Please click "Continue with Google" above.';
      case 'auth/unauthorized-domain':
        return 'Sign-in is currently unavailable on this domain. Please try again later.';
      case 'auth/too-many-requests':
        return 'Too many failed login attempts. Please try again later.';
      case 'auth/network-request-failed':
        return 'Network connection issue. Please check your internet connection.';
      default:
        return error?.message || 'Authentication failed. Please try again.';
    }
  }
}
