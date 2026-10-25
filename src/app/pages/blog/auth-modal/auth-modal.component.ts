import { Component, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-auth-modal',
  templateUrl: './auth-modal.component.html'
})
export class AuthModalComponent {
  @Output() close = new EventEmitter<void>();
  @Output() authenticated = new EventEmitter<void>();

  isRegister = false;
  email = '';
  password = '';
  errorMsg = '';
  isLoading = false;

  constructor(public authService: AuthService) {}

  toggleMode(): void {
    this.isRegister = !this.isRegister;
    this.errorMsg = '';
  }

  currentDomain: string = typeof window !== 'undefined' ? window.location.hostname : 'bhaktipokhrel.com';
  firebaseConsoleUrl: string = 'https://console.firebase.google.com/project/project-6c6397b8-aa35-4167-ba7/authentication/settings';
  isUnauthorizedDomain: boolean = false;
  copiedDomain: boolean = false;

  async copyDomain(): Promise<void> {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(this.currentDomain);
      }
      this.copiedDomain = true;
      setTimeout(() => { this.copiedDomain = false; }, 2500);
    } catch {
      this.copiedDomain = true;
      setTimeout(() => { this.copiedDomain = false; }, 2500);
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('auth-modal-backdrop')) {
      this.close.emit();
    }
  }

  async signInWithGoogle(): Promise<void> {
    this.isLoading = true;
    this.errorMsg = '';
    this.isUnauthorizedDomain = false;
    try {
      await this.authService.signInWithGoogle();
      this.authenticated.emit();
      this.close.emit();
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('authorized domain') || err?.code === 'auth/unauthorized-domain') {
        this.isUnauthorizedDomain = true;
      }
      this.errorMsg = msg || 'Google sign in failed.';
    } finally {
      this.isLoading = false;
    }
  }

  async submitEmailAuth(): Promise<void> {
    if (!this.email || !this.password) {
      this.errorMsg = 'Please enter both email and password.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMsg = 'Password must be at least 6 characters.';
      return;
    }

    this.isLoading = true;
    this.errorMsg = '';
    try {
      if (this.isRegister) {
        await this.authService.registerWithEmail(this.email, this.password);
      } else {
        await this.authService.signInWithEmail(this.email, this.password);
      }
      this.authenticated.emit();
      this.close.emit();
    } catch (err: any) {
      this.errorMsg = err.message || 'Authentication failed.';
    } finally {
      this.isLoading = false;
    }
  }
}
