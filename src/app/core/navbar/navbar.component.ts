import { Component } from '@angular/core';

@Component({
  selector: 'app-navbar',
  template: `
    <nav>
      <a routerLink="/">Bhakti Pokhrel</a>
      <div>
        <a routerLink="/projects">Projects</a>
        <a routerLink="/about">About</a>
        <a routerLink="/resume">Resume</a>
        <a routerLink="/contact">Contact</a>
      </div>
    </nav>
  `,
  styles: [`
    nav {
      display: flex;
      justify-content: space-between;
      padding: 1rem 2rem;
      background: #020617;
    }
    a {
      margin-left: 1rem;
      font-weight: 500;
    }
  `]
})
export class NavbarComponent {}
