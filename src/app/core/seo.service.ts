import { Injectable, Inject } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class SeoService {
  private readonly defaultBaseUrl = 'https://www.bhaktipokhrel.com';
  private readonly defaultImage = 'https://www.bhaktipokhrel.com/assets/bhaktipo.png';

  constructor(
    private title: Title,
    private meta: Meta,
    @Inject(DOCUMENT) private doc: Document
  ) {}

  update(
    title: string,
    description: string,
    routePath: string = '/',
    imageUrl?: string
  ): void {
    const fullUrl = `${this.defaultBaseUrl}${routePath.startsWith('/') ? routePath : '/' + routePath}`;
    const img = imageUrl || this.defaultImage;

    // 1. Browser Window & Search Engine Snippet Title
    this.title.setTitle(title);

    // 2. Standard Search Engine Meta
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({
      name: 'keywords',
      content:
        'Software, Software Engineer, Software Developer, Developer, Engineer, Full Stack Engineer, Full Stack Developer, .NET Developer, Angular Developer, C# Developer, Azure Cloud Engineer, Bhakti Pokhrel, MedPace, Frontend Engineer, Backend Engineer, Web Developer, Web Application Architecture, Microservices, TypeScript, SQL Server'
    });
    this.meta.updateTag({ name: 'author', content: 'Bhakti Pokhrel' });
    this.meta.updateTag({
      name: 'robots',
      content: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'
    });

    // 3. Open Graph (LinkedIn, Facebook, Discord, Slack, iMessage)
    this.meta.updateTag({ property: 'og:site_name', content: 'Bhakti Pokhrel — Software Engineer' });
    this.meta.updateTag({ property: 'og:title', content: title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:url', content: fullUrl });
    this.meta.updateTag({ property: 'og:image', content: img });
    this.meta.updateTag({ property: 'og:image:secure_url', content: img });
    this.meta.updateTag({ property: 'og:image:width', content: '1200' });
    this.meta.updateTag({ property: 'og:image:height', content: '630' });
    this.meta.updateTag({ property: 'og:image:alt', content: title });
    this.meta.updateTag({ property: 'og:locale', content: 'en_US' });

    // 4. Twitter / X Card Meta
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: img });
    this.meta.updateTag({ name: 'twitter:image:alt', content: title });

    // 5. Canonical Link
    this.updateCanonicalUrl(fullUrl);
  }

  private updateCanonicalUrl(url: string): void {
    try {
      let link: HTMLLinkElement | null = this.doc.querySelector("link[rel='canonical']");
      if (!link) {
        link = this.doc.createElement('link');
        link.setAttribute('rel', 'canonical');
        this.doc.head.appendChild(link);
      }
      link.setAttribute('href', url);
    } catch {
      // safe fallback if DOM is unavailable
    }
  }
}
