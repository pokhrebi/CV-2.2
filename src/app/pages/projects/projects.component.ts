import { Component, OnInit } from '@angular/core';
import { SeoService } from '../../core/seo.service';

@Component({
  templateUrl: './projects.component.html'
})
export class ProjectsComponent implements OnInit {
  constructor(private seo: SeoService) {}

  ngOnInit() {
    this.seo.update(
      'Projects | Bhakti Pokhrel',
      'Software projects by Bhakti Pokhrel including Angular and ASP.NET applications.'
    );
  }
}
