import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  // EmailJS credentials from environment
  private readonly SERVICE_ID = environment.emailjs.serviceId;
  private readonly TEMPLATE_ID = environment.emailjs.templateId;
  private readonly PUBLIC_KEY = environment.emailjs.publicKey;

  constructor() {
    // Initialize EmailJS
    emailjs.init(this.PUBLIC_KEY);
  }

  /**
   * Submit contact form via EmailJS
   */
  async submitContact(contactData: {
    from_name: string;
    from_email: string;
    phone: string;
    subject: string;
    message: string;
    timestamp: string;
  }): Promise<void> {
    try {
      const response = await emailjs.send(this.SERVICE_ID, this.TEMPLATE_ID, {
        from_name: contactData.from_name,
        from_email: contactData.from_email,
        phone: contactData.phone,
        subject: contactData.subject,
        message: contactData.message,
        timestamp: contactData.timestamp
      });

      console.log('✅ Email sent successfully via EmailJS', response);
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      throw new Error('Failed to send message. Please try again later.');
    }
  }
}