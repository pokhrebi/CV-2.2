import { Component, OnInit } from '@angular/core';
import { SeoService } from '../../core/seo.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html'
})
export class ContactComponent implements OnInit {
  name: string = '';
  email: string = '';
  phone: string = '';
  subject: string = '';
  message: string = '';
  showSuccessMessage: boolean = false;
  isSubmitting: boolean = false;

  // Anti-bot measures
  mathNum1: number = 0;
  mathNum2: number = 0;
  mathAnswer: number = 0;
  userMathAnswer: string = '';
  honeypot: string = ''; // Hidden field for bots

  // Rate limiting
  private lastSubmissionTime: number = 0;
  private readonly SUBMISSION_COOLDOWN = 30000; // 30 seconds

  constructor(private seo: SeoService) {
    this.generateMathQuestion();
  }

  ngOnInit(): void {
    this.seo.update('Contact - Bhakti Pokhrel', 'Contact Bhakti Pokhrel');
  }

  generateMathQuestion(): void {
    this.mathNum1 = Math.floor(Math.random() * 10) + 1;
    this.mathNum2 = Math.floor(Math.random() * 10) + 1;
    this.mathAnswer = this.mathNum1 + this.mathNum2;
  }

  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  validatePhone(phone: string): boolean {
    // More flexible phone validation - allows various formats
    const phoneRegex = /^[\+]?[\d\s\-\(\)\.]{10,15}$/;
    const cleanedPhone = phone.replace(/[\s\-\(\)\.]/g, '');
    return cleanedPhone.length >= 10 && cleanedPhone.length <= 15 && /^\d+$/.test(cleanedPhone);
  }

  isFormValid(): boolean {
    const mathValid = !isNaN(parseInt(this.userMathAnswer)) && parseInt(this.userMathAnswer) === this.mathAnswer;
    return !!(
      this.name.trim() &&
      this.validateEmail(this.email) &&
      this.validatePhone(this.phone) &&
      this.subject.trim() &&
      this.message.trim() &&
      mathValid &&
      !this.honeypot // Honeypot should be empty
    );
  }

  async submitForm(): Promise<void> {
    if (!this.isFormValid()) {
      return;
    }

    // Rate limiting check
    const now = Date.now();
    if (now - this.lastSubmissionTime < this.SUBMISSION_COOLDOWN) {
      alert('Please wait 30 seconds before sending another message.');
      return;
    }

    this.isSubmitting = true;

    try {
      // Prepare contact data
      const contactData = {
        from_name: this.name,
        from_email: this.email,
        phone: this.phone,
        subject: this.subject,
        message: this.message,
        timestamp: new Date().toISOString()
      };

      // Open user's email client via mailto: (sends to owner's email)
      const ownerEmail = 'myphotosfirst@gmail.com';
      const subject = encodeURIComponent(`[Website] ${contactData.subject}`);
      const bodyLines = [
        `Name: ${contactData.from_name}`,
        `Email: ${contactData.from_email}`,
        `Phone: ${contactData.phone}`,
        '',
        contactData.message,
        '',
        `Sent: ${contactData.timestamp}`
      ];
      const body = encodeURIComponent(bodyLines.join('\n'));
      const mailto = `mailto:${ownerEmail}?subject=${subject}&body=${body}`;
      // Use window.open so user can edit before sending
      window.open(mailto, '_blank');

      // Success
      this.showSuccessMessage = true;
      this.resetForm();
      this.lastSubmissionTime = now;

      // Hide success message after 5 seconds
      setTimeout(() => {
        this.showSuccessMessage = false;
      }, 5000);

    } catch (error) {
      console.error('Email sending failed:', error);
      alert('Sorry, there was an error preparing the message. Please try again later.');
    } finally {
      this.isSubmitting = false;
    }
  }

  resetForm(): void {
    this.name = '';
    this.email = '';
    this.phone = '';
    this.subject = '';
    this.message = '';
    this.userMathAnswer = '';
    this.honeypot = '';
    this.generateMathQuestion();
  }
}
