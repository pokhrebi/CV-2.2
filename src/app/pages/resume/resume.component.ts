import { Component, OnInit } from '@angular/core';
import { SeoService } from '../../core/seo.service';

@Component({
  selector: 'app-resume',
  templateUrl: './resume.component.html'
})
export class ResumeComponent implements OnInit {
  copiedLink: boolean = false;
  activeFilter: string = 'all';

  readonly filterTabs = [
    { id: 'all', label: 'Full Resume' },
    { id: 'experience', label: 'Experience' },
    { id: 'skills', label: 'Skills' },
    { id: 'education', label: 'Education' },
    { id: 'certifications', label: 'Certifications' },
    { id: 'projects', label: 'Key Projects' }
  ];

  constructor(private seo: SeoService) { }

  ngOnInit(): void {
    this.seo.update(
      'Resume — Bhakti Pokhrel | Software Engineer II & Full-Stack Developer',
      'Professional resume of Bhakti Pokhrel: Software Engineer II specializing in Angular, TypeScript, C#, .NET 8, Microsoft Azure, and SQL Server. View complete experience, skills, and certifications.',
      '/resume'
    );
  }

  setFilter(filterId: string): void {
    this.activeFilter = filterId;
  }

  printResume(): void {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }

  async copyShareLink(): Promise<void> {
    try {
      const url = typeof window !== 'undefined' ? window.location.href : 'https://www.bhaktipokhrel.com/resume';
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
      this.copiedLink = true;
      setTimeout(() => {
        this.copiedLink = false;
      }, 2500);
    } catch {
      // Fallback
      this.copiedLink = true;
      setTimeout(() => {
        this.copiedLink = false;
      }, 2000);
    }
  }
}
