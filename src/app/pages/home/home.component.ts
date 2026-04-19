import { Component, OnInit } from '@angular/core';
import { SeoService } from '../../core/seo.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html'
})
export class HomeComponent implements OnInit {

  constructor(private seo: SeoService) { }

  ngOnInit(): void {
    this.seo.update(
      'Bhakti Pokhrel — Software Engineer',
      'Full-stack engineer crafting scalable, human-centered web applications with Angular, .NET and Azure.'
    );
  }
}
