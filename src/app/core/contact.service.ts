import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private readonly STORAGE_KEY = 'contact_submissions';
  private readonly MAX_SUBMISSIONS_PER_EMAIL = 2;

  constructor() { }

  /**
   * Submit contact form locally with rate limiting per email.
   * Stores submissions in localStorage.
   * Limits to 2 submissions per email address.
   */
  async submitContact(contactData: {
    from_name: string;
    from_email: string;
    phone: string;
    subject: string;
    message: string;
    timestamp: string;
  }): Promise<void> {
    // Check submission limit for this email
    const existingSubmissions = this.getSubmissions();
    const submissionsFromEmail = existingSubmissions.filter(
      (sub: any) => sub.from_email === contactData.from_email
    );

    if (submissionsFromEmail.length >= this.MAX_SUBMISSIONS_PER_EMAIL) {
      throw new Error(`Maximum ${this.MAX_SUBMISSIONS_PER_EMAIL} submissions allowed per email address.`);
    }

    // Store submission in localStorage
    existingSubmissions.push(contactData);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existingSubmissions));

    // Log for dev/verification (developer console only)
    console.log('✅ Contact form submitted and stored locally.');
    console.log('📝 Submission:', contactData);
    console.log(`📊 Total submissions from ${contactData.from_email}: ${submissionsFromEmail.length + 1}/${this.MAX_SUBMISSIONS_PER_EMAIL}`);

    // Simulate a brief delay to mimic a real submission
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  /**
   * Retrieve all stored submissions
   */
  getSubmissions(): any[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading submissions:', error);
      return [];
    }
  }

  /**
   * Clear all submissions from localStorage
   */
  clearSubmissions(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Get submission count for a specific email
   */
  getSubmissionCountForEmail(email: string): number {
    const submissions = this.getSubmissions();
    return submissions.filter((sub: any) => sub.from_email === email).length;
  }
}