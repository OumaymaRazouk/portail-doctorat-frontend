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
      height: 70px;
      background-color: #343a40;
      color: white;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      width: 100%;
    }
    
    .logo {
      font-weight: bold;
      font-size: 1.2rem;
    }
    
    .logout-btn {
      background: transparent;
      color: white;
      border: 1px solid rgba(255,255,255,0.5);
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    
    .logout-btn:hover {
      background-color: rgba(255,255,255,0.1);
      border-color: white;
    }
  `]
})
export class HeaderComponent {
  constructor(private auth: AuthService, private router: Router) {}
  logout() { this.auth.logout(); this.router.navigateByUrl('/login'); }
}
