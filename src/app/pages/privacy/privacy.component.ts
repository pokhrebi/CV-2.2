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
      'Privacy & Ad Disclosure — Bhakti Pokhrel',
      'Privacy policy, cookie disclosures, and advertising practices compliant with Google AdSense and international privacy regulations.'
    );
  }
}
