import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html'
})
export class NavbarComponent implements OnInit, OnDestroy {
  menuOpen = false;
  isDark = false;
  scrolled = false;
  private routerSub?: Subscription;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const saved = localStorage.getItem('theme');
    if (saved === 'dark') {
      this.isDark = true;
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      this.isDark = false;
      document.documentElement.removeAttribute('data-theme');
    }

    // Auto-close menu on navigation
    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.closeMenu();
      });

    this.checkScroll();
  }

  ngOnDestroy(): void {
    this.routerSub?.unsubscribe();
    document.body.style.overflow = '';
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.checkScroll();
  }

  @HostListener('window:resize')
  onResize(): void {
    if (window.innerWidth > 860 && this.menuOpen) {
      this.closeMenu();
    }
  }

  @HostListener('window:keydown.escape')
  onEscape(): void {
    if (this.menuOpen) {
      this.closeMenu();
    }
  }

  private checkScroll(): void {
    if (typeof window !== 'undefined') {
      this.scrolled = window.scrollY > 16;
    }
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = this.menuOpen ? 'hidden' : '';
      if (this.menuOpen) {
        document.body.classList.add('mobile-menu-active');
      } else {
        document.body.classList.remove('mobile-menu-active');
      }
    }
  }

  closeMenu(): void {
    this.menuOpen = false;
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
      document.body.classList.remove('mobile-menu-active');
    }
  }

  toggleTheme(): void {
    this.isDark = !this.isDark;
    if (this.isDark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  }
}
