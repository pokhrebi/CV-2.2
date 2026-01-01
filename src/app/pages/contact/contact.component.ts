import { Component } from '@angular/core';

@Component({
  template: `
    <h1>Contact</h1>

    <p>
      Interested in working together or have a question?
      Feel free to reach out.
    </p>

    <ul>
      <li>Email: <a href="mailto:youremail@example.com">youremail@example.com</a></li>
      <li>GitHub: <a href="https://github.com/yourusername" target="_blank">github.com/yourusername</a></li>
      <li>LinkedIn: <a href="https://linkedin.com/in/yourprofile" target="_blank">linkedin.com/in/yourprofile</a></li>
    </ul>
  `
})
export class ContactComponent {}
