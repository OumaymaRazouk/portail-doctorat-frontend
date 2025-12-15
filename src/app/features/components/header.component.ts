import { Component } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
  <header class="header">
    <span class="logo">🎓 DoctoApp</span>
    <button class="logout-btn" (click)="logout()">Déconnexion</button>
  </header>
  `,
  styles: [`
    .header {
      height: 64px;
      background-color: var(--secondary);
      color: var(--secondary-foreground);
      padding: 0 1.75rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: var(--shadow-soft);
      width: 100%;
      position: relative;
      z-index: 10;
    }

    .logo {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 700;
      font-size: 1.1rem;
      letter-spacing: 0.02em;
    }

    .logout-btn {
      background-color: transparent;
      color: var(--secondary-foreground);
      border: 1px solid rgba(148, 163, 184, 0.7);
      padding: 6px 14px;
      border-radius: 999px;
      font-size: 0.8rem;
      cursor: pointer;
      transition: background-color 0.2s ease, color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
    }

    .logout-btn:hover {
      background-color: rgba(248, 250, 252, 0.06);
      box-shadow: 0 4px 10px rgba(15, 23, 42, 0.35);
      transform: translateY(-1px);
    }
  `]
})
export class HeaderComponent {
  constructor(private auth: AuthService, private router: Router) {}
  logout() { this.auth.logout(); this.router.navigateByUrl('/login'); }
}
