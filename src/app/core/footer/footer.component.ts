import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  template: `
    <footer>
      © {{ year }} Bhakti Pokhrel
    </footer>
  `,
  styles: [`
    footer {
      text-align: center;
      padding: 1.5rem;
      font-size: 0.9rem;
      color: #94a3b8;
    }
  `]
})
export class FooterComponent {
  year = new Date().getFullYear();
}
