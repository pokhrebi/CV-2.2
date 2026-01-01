import { Component, OnInit } from '@angular/core';
import { SeoService } from '../../core/seo.service';

@Component({
  templateUrl: './about.component.html'
})
export class AboutComponent implements OnInit {
  constructor(private seo: SeoService) {}

  ngOnInit(): void {
    this.seo.update(
      'About | Bhakti Pokhrel',
      'Learn more about Bhakti Pokhrel, a Full-Stack Software Engineer specializing in Angular, ASP.NET Core, and Azure.'
    );
  }
}

