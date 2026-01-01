import { Component, OnInit } from '@angular/core';
import { SeoService } from '../../core/seo.service';

@Component({
  templateUrl: './contact.component.html'
})
export class ContactComponent implements OnInit {
  constructor(private seo: SeoService) {}

  ngOnInit(): void {
    this.seo.update(
      'Contact | Bhakti Pokhrel',
      'Contact Bhakti Pokhrel for software engineering opportunities, collaborations, or inquiries.'
    );
  }
}
