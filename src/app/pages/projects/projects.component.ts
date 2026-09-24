import { Component, OnInit } from '@angular/core';
import { SeoService } from '../../core/seo.service';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html'
})
export class ProjectsComponent implements OnInit {

  constructor(private seo: SeoService) { }

  ngOnInit(): void {
    this.seo.update(
      'Selected Work & Software Projects — Bhakti Pokhrel | Software Engineer',
      'Explore software engineering projects by Bhakti Pokhrel: TrackCM (multi-tenant SaaS platform with Angular 19 & .NET 8), GoldTracker (native SwiftUI iOS app), and enterprise clinical platform architecture.',
      '/projects'
    );
  }
}
