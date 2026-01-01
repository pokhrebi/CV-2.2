import { Component, OnInit } from '@angular/core';
import { SeoService } from '../../core/seo.service';

@Component({
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {
  constructor(private seo: SeoService) {}

  ngOnInit() {
    this.seo.update(
      'Bhakti Pokhrel | Full-Stack Software Engineer',
      'Portfolio of Bhakti Pokhrel, a Full-Stack Software Engineer specializing in Angular, ASP.NET, and Azure.'
    );
  }
}
