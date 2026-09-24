import { Component, OnInit } from '@angular/core';
import { SeoService } from '../../core/seo.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html'
})
export class AboutComponent implements OnInit {

  constructor(private seo: SeoService) { }

  ngOnInit(): void {
    this.seo.update(
      'About — Bhakti Pokhrel | Software Engineer & Full-Stack Developer',
      'Learn about Bhakti Pokhrel, Software Engineer II at MedPace. Explore engineering background, Azure certifications (AZ-900, DP-900), and interactive D3 technical skills visualization.',
      '/about'
    );
  }
}
