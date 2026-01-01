import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html'
})
export class NavbarComponent {
  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  toggleTheme() {
    const isDark = !document.documentElement.hasAttribute('data-theme');
    document.documentElement.toggleAttribute('data-theme', isDark);
  }
}
