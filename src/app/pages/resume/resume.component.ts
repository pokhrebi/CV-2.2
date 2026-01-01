import { Component, OnInit } from '@angular/core';
import { SeoService } from '../../core/seo.service';

@Component({
  templateUrl: './resume.component.html'
})
export class ResumeComponent implements OnInit {
  constructor(private seo: SeoService) {}

  ngOnInit(): void {
    this.seo.update(
      'Resume | Bhakti Pokhrel',
      'Download the resume of Bhakti Pokhrel, a Full-Stack Software Engineer with experience in Angular, ASP.NET, and Azure.'
    );
  }
}
