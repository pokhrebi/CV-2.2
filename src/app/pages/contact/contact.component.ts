import { Component, OnInit } from '@angular/core';
import { SeoService } from '../../core/seo.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html'
})
export class ContactComponent implements OnInit {
  name: string = '';
  email: string = '';
  subject: string = '';
  message: string = '';

  constructor(private seo: SeoService) { }

  ngOnInit(): void {
    this.seo.update('Contact - Bhakti Pokhrel', 'Contact Bhakti Pokhrel');
  }

  submitForm(): void {
    if (this.name && this.email && this.subject && this.message) {
      // In a real application, you would send this to a backend service
      console.log({
        name: this.name,
        email: this.email,
        subject: this.subject,
        message: this.message
      });
      
      // Reset form
      this.name = '';
      this.email = '';
      this.subject = '';
      this.message = '';
      
      alert('Thank you for your message! I will get back to you soon.');
    }
  }
}
