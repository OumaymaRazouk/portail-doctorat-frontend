import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
  <footer class="footer">
    © 2025 DoctoApp — Portail de suivi du doctorat
  </footer>
  `,
  styles: [`
    .footer { 
      height: 50px;
      font-size: 0.9em;
      text-align: center;
      padding: 12px;
      background-color: #343a40;
      color: #f8f9fa;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    }
  `]
})
export class FooterComponent {}
