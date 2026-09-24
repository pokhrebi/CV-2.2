import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-cookie-consent',
  template: `
    <div class="cookie-banner" *ngIf="showBanner" role="dialog" aria-live="polite" aria-label="Cookie and ad preferences">
      <div class="cookie-content">
        <p class="cookie-text">
          We use cookies and Google AdSense to serve contextual ads and improve site experience.
          Learn more in our <a routerLink="/privacy" class="cookie-link">Privacy &amp; Ad Disclosure</a>.
        </p>
        <div class="cookie-actions">
          <button (click)="accept()" class="cookie-btn cookie-btn-accept" aria-label="Accept cookies and continue">
            Got it
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cookie-banner {
      position: fixed;
      bottom: 1.25rem;
      right: 1.25rem;
      max-width: 420px;
      background: var(--bg);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
      padding: 1rem 1.25rem;
      z-index: 1000;
      animation: slideUp 0.35s ease-out;
    }

    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    .cookie-content {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .cookie-text {
      font-size: 0.82rem;
      line-height: 1.5;
      color: var(--text-muted);
      margin: 0;
    }

    .cookie-link {
      color: var(--text);
      text-decoration: underline;
      border-bottom: none;
    }

    .cookie-actions {
      display: flex;
      justify-content: flex-end;
    }

    .cookie-btn {
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      padding: 0.4rem 1rem;
      border-radius: var(--radius);
      transition: all 0.2s ease;
      cursor: pointer;
    }

    .cookie-btn-accept {
      background: var(--accent);
      color: var(--bg);
    }

    .cookie-btn-accept:hover {
      opacity: 0.88;
    }

    @media (max-width: 600px) {
      .cookie-banner {
        left: 1rem;
        right: 1rem;
        bottom: calc(env(safe-area-inset-bottom, 0px) + 0.85rem);
        max-width: none;
      }
    }
  `]
})
export class CookieConsentComponent implements OnInit {
  showBanner: boolean = false;
  private readonly STORAGE_KEY = 'bp_cookie_ad_consent';

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      const consent = localStorage.getItem(this.STORAGE_KEY);
      if (!consent) {
        // Show after a slight delay to avoid jarring initial load
        setTimeout(() => {
          this.showBanner = true;
        }, 1200);
      }
    }
  }

  accept(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, 'accepted_' + new Date().toISOString());
    }
    this.showBanner = false;
  }
}
