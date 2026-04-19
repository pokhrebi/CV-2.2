import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {

  ngOnInit(): void {
    document.body.classList.add('page-loaded');
    this.setupRevealObserver();
  }

  @HostListener('window:scroll')
  onScroll() {
    const progress = document.getElementById('scrollProgress');
    const nav = document.querySelector('.nav-wrap');
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progress) progress.style.width = pct + '%';
    if (nav) {
      if (scrollTop > 8) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }
  }

  private setupRevealObserver(): void {
    // Re-observe on every route change since content re-renders
    const observe = () => {
      const els = document.querySelectorAll('.reveal:not(.visible)');
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
      els.forEach(el => observer.observe(el));
    };

    // Initial + on route change (DOM mutations)
    observe();
    const mo = new MutationObserver(() => observe());
    mo.observe(document.body, { childList: true, subtree: true });
  }
}
