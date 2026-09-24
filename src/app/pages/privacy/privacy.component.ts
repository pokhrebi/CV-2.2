import { Component, OnInit } from '@angular/core';
import { SeoService } from '../../core/seo.service';

@Component({
  selector: 'app-privacy',
  templateUrl: './privacy.component.html'
})
export class PrivacyComponent implements OnInit {

  constructor(private seo: SeoService) { }

  ngOnInit(): void {
    this.seo.update(
      'Privacy & Advertising Disclosure — Bhakti Pokhrel | Software Engineer',
      'Privacy policy, cookie consent disclosures, and Google AdSense advertising transparency statements for Bhakti Pokhrel\'s software engineer portfolio.',
      '/privacy'
    );
  }
}
