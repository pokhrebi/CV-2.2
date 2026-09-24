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
      'Bhakti Pokhrel — Software Engineer | Full-Stack .NET & Angular Developer',
      'Official portfolio of Software Engineer Bhakti Pokhrel. Specializing in full-stack web applications with Angular, C#, .NET 8, Microsoft Azure, and SQL Server.',
      '/'
    );
  }
}
