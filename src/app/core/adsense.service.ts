import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdsenseService {
  readonly clientId = 'ca-pub-8493367997657434';
  private isAdBlockerActive = false;

  constructor(private router: Router) {
    this.initSpaTracking();
  }

  /**
   * Safe execution of Google AdSense push on an ad slot
   */
  pushAd(): void {
    if (typeof window === 'undefined') return;

    try {
      const adsbygoogle = (window as any).adsbygoogle || [];
      adsbygoogle.push({});
    } catch (e: any) {
      // Common AdSense errors in SPA environments:
      // - "All 'ins' elements in the DOM with class=adsbygoogle already have ads in them"
      // - Adblockers blocking script execution
      if (e?.message && e.message.includes('adsbygoogle.push() error')) {
        // Tag already filled or slot queued
      } else {
        this.isAdBlockerActive = true;
      }
    }
  }

  /**
   * Listen to Angular SPA route changes and notify Google AdSense auto ads if active
   */
  private initSpaTracking(): void {
    if (typeof window === 'undefined') return;

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        // Give the DOM 150ms to settle after route transition
        setTimeout(() => {
          try {
            if ((window as any).adsbygoogle && typeof (window as any).adsbygoogle.push === 'function') {
              // Trigger page-level ad check for single-page app transitions
              ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({
                params: {
                  google_ad_client: this.clientId
                }
              });
            }
          } catch {
            // Silently ignore if already pushed or blocked
          }
        }, 150);
      });
  }

  hasAdBlocker(): boolean {
    return this.isAdBlockerActive;
  }
}
