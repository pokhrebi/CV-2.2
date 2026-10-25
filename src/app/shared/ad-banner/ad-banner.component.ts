import { Component, Input, AfterViewInit, ElementRef, ViewChild, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { AdsenseService } from '../../core/adsense.service';

@Component({
  selector: 'app-ad-banner',
  template: `
    <aside class="ad-unit-wrapper" [class.is-in-article]="layout === 'in-article'" [class.has-custom-class]="customClass" [ngClass]="customClass" [attr.aria-label]="label">
      <div class="ad-unit-header">
        <span class="ad-unit-label">
          <svg *ngIf="layout === 'in-article'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-right: 4px; vertical-align: -1px; opacity: 0.7;">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          {{ label }}
        </span>
        <a routerLink="/privacy" class="ad-unit-info" title="Why this ad? Read our Ad & Cookie Policy">Ad Info · Privacy</a>
      </div>
      <div class="ad-unit-box" [style.min-height]="minHeight" #adBox>
        <ins class="adsbygoogle"
             style="display:block; text-align:center;"
             [attr.data-ad-client]="clientId"
             [attr.data-ad-slot]="slot || null"
             [attr.data-ad-layout]="layout || null"
             [attr.data-ad-format]="effectiveFormat"
             [attr.data-full-width-responsive]="fullWidthResponsive ? 'true' : 'false'">
        </ins>
      </div>
    </aside>
  `,
  styles: [`
    .ad-unit-wrapper {
      margin: 2.75rem 0;
      width: 100%;
      text-align: center;
      position: relative;
      clear: both;
    }

    .ad-unit-wrapper.is-in-article {
      margin: 3.25rem 0;
      padding: 0.5rem 0;
    }

    .ad-unit-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 760px;
      margin: 0 auto 0.45rem;
      padding: 0 0.5rem;
    }

    .ad-unit-label {
      font-size: 0.65rem;
      letter-spacing: 0.16em;
      text-transform: uppercase;
      font-weight: 600;
      color: var(--text-muted);
      opacity: 0.85;
      display: inline-flex;
      align-items: center;
    }

    .ad-unit-info {
      font-size: 0.65rem;
      color: var(--text-muted);
      opacity: 0.7;
      border-bottom: 1px dotted var(--line);
      transition: opacity 0.2s ease, color 0.2s ease;
      text-decoration: none;
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
      padding: 0.75rem 0.5rem;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }

    .is-in-article .ad-unit-box {
      background: rgba(0, 0, 0, 0.015);
      border-style: dashed;
    }

    :host-context([data-theme="dark"]) .is-in-article .ad-unit-box {
      background: rgba(255, 255, 255, 0.02);
    }

    .ad-unit-box:hover {
      border-color: rgba(0, 0, 0, 0.2);
    }

    :host-context([data-theme="dark"]) .ad-unit-box:hover {
      border-color: rgba(255, 255, 255, 0.2);
    }

    .adsbygoogle {
      width: 100%;
      min-width: 250px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdBannerComponent implements OnInit, AfterViewInit {
  @Input() slot: string = '';
  @Input() layout: 'in-article' | '' = '';
  @Input() format: 'auto' | 'fluid' | 'horizontal' | 'rectangle' | 'vertical' = 'auto';
  @Input() fullWidthResponsive: boolean = true;
  @Input() minHeight: string = '120px';
  @Input() label: string = 'Advertisement';
  @Input() customClass: string = '';

  @ViewChild('adBox') adBoxRef?: ElementRef;

  readonly clientId: string;

  get effectiveFormat(): string {
    if (this.layout === 'in-article') {
      return 'fluid';
    }
    return this.format;
  }

  constructor(private adsenseService: AdsenseService) {
    this.clientId = this.adsenseService.clientId;
  }

  ngOnInit(): void {
    if (this.layout === 'in-article' && this.minHeight === '120px') {
      this.minHeight = '90px';
    }
  }

  ngAfterViewInit(): void {
    // Delay slightly to let layout compute dimensions and avoid "No slot size for availableWidth=0" error
    setTimeout(() => {
      this.adsenseService.pushAd();
    }, 120);
  }
}

