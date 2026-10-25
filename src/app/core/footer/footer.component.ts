import { Component } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { FirebaseService } from '../services/firebase.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html'
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();

  constructor(
    public authService: AuthService,
    public firebaseService: FirebaseService
  ) {}

  async signOut(): Promise<void> {
    try {
      await this.authService.signOut();
      await this.firebaseService.logOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  }
}
