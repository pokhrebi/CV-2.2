import { Component, Input, AfterViewInit, ElementRef, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { AdsenseService } from '../../core/adsense.service';

@Component({
  selector: 'app-ad-banner',
  template: `
    <aside class="ad-unit-wrapper" [class.has-custom-class]="customClass" [ngClass]="customClass" [attr.aria-label]="label">
      <div class="ad-unit-header">
        <span class="ad-unit-label">{{ label }}</span>
        <a routerLink="/privacy" class="ad-unit-info" title="Why this ad? Read our Ad & Cookie Policy">Ad Info · Privacy</a>
      </div>
      <div class="ad-unit-box" [style.min-height]="minHeight" #adBox>
        <ins class="adsbygoogle"
             style="display:block"
             [attr.data-ad-client]="clientId"
             [attr.data-ad-slot]="slot || null"
             [attr.data-ad-format]="format"
             [attr.data-full-width-responsive]="fullWidthResponsive ? 'true' : 'false'">
        </ins>
      </div>
    </aside>
  `,
  styles: [`
    .ad-unit-wrapper {
      margin: 2.5rem 0;
      width: 100%;
      text-align: center;
      position: relative;
    }

    .ad-unit-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 760px;
      margin: 0 auto 0.4rem;
      padding: 0 0.5rem;
    }

    .ad-unit-label {
      font-size: 0.65rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      font-weight: 600;
      color: var(--text-muted);
      opacity: 0.85;
    }

    .ad-unit-info {
      font-size: 0.65rem;
      color: var(--text-muted);
      opacity: 0.7;
      border-bottom: 1px dotted var(--line);
      transition: opacity 0.2s ease, color 0.2s ease;
    }

    .ad-unit-info:hover {
      opacity: 1;
      color: var(--text);
    }

    .ad-unit-box {
      max-width: 760px;
      margin: 0 auto;
      background: var(--bg-alt);
      border: 1px solid var(--line);
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      box-sizing: border-box;
      padding: 0.5rem;
      transition: border-color 0.2s ease;
    }

    .ad-unit-box:hover {
      border-color: rgba(0,0,0,0.15);
    }

    :host-context([data-theme="dark"]) .ad-unit-box:hover {
      border-color: rgba(255,255,255,0.18);
    }

    .adsbygoogle {
      width: 100%;
      min-width: 250px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdBannerComponent implements AfterViewInit {
  @Input() slot: string = '';
  @Input() format: 'auto' | 'horizontal' | 'rectangle' | 'vertical' = 'auto';
  @Input() fullWidthResponsive: boolean = true;
  @Input() minHeight: string = '120px';
  @Input() label: string = 'Advertisement';
  @Input() customClass: string = '';

  @ViewChild('adBox') adBoxRef?: ElementRef;

  readonly clientId: string;

  constructor(private adsenseService: AdsenseService) {
    this.clientId = this.adsenseService.clientId;
  }

  ngAfterViewInit(): void {
    // Delay slightly to let layout compute dimensions and avoid "No slot size for availableWidth=0" error
    setTimeout(() => {
      this.adsenseService.pushAd();
    }, 100);
  }
}
