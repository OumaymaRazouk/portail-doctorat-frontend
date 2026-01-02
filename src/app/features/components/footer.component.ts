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
      background: rgba(2, 6, 23, 0.7);
      color: rgba(229, 231, 235, 0.85);
      border-top: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
    }
  `]
})
export class FooterComponent {}
