import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  constructor() { }

  async sendContactEmail(contactData: {
    to_email: string;
    from_name: string;
    from_email: string;
    phone: string;
    subject: string;
    message: string;
    timestamp: string;
  }): Promise<void> {
    // For production, replace this with your preferred email service

    // Option 1: EmailJS (recommended for static sites)
    // return this.sendWithEmailJS(contactData);

    // Option 2: Netlify Forms (if deploying to Netlify)
    // return this.sendWithNetlify(contactData);

    // Option 3: Custom backend API
    // return this.sendWithAPI(contactData);

    // For now, simulate sending
    return this.simulateSend(contactData);
  }

  private async sendWithEmailJS(contactData: any): Promise<void> {
    // EmailJS implementation
    // You'll need to install @emailjs/browser and set up your EmailJS account
    /*
    import emailjs from '@emailjs/browser';

    const serviceId = 'your_service_id';
    const templateId = 'your_template_id';
    const publicKey = 'your_public_key';

    const templateParams = {
      to_email: contactData.to_email,
      from_name: contactData.from_name,
      from_email: contactData.from_email,
      phone: contactData.phone,
      subject: contactData.subject,
      message: contactData.message,
      timestamp: contactData.timestamp
    };

    return emailjs.send(serviceId, templateId, templateParams, publicKey);
    */
    throw new Error('EmailJS not configured. Please set up EmailJS or use another service.');
  }

  private async sendWithNetlify(contactData: any): Promise<void> {
    // Netlify Forms implementation
    const formData = new FormData();
    formData.append('form-name', 'contact');
    formData.append('name', contactData.from_name);
    formData.append('email', contactData.from_email);
    formData.append('phone', contactData.phone);
    formData.append('subject', contactData.subject);
    formData.append('message', contactData.message);

    const response = await fetch('/', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }
  }

  private async sendWithAPI(contactData: any): Promise<void> {
    // Custom API implementation
    const response = await fetch('https://your-api-endpoint.com/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactData)
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }
  }

  private async simulateSend(contactData: any): Promise<void> {
    // Simulate API call for development
    console.log('📧 Email would be sent to:', contactData.to_email);
    console.log('📝 Message details:', {
      from: `${contactData.from_name} <${contactData.from_email}>`,
      phone: contactData.phone,
      subject: contactData.subject,
      message: contactData.message,
      timestamp: contactData.timestamp
    });

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate occasional failures for testing
    if (Math.random() < 0.1) {
      throw new Error('Simulated network error');
    }
  }
}