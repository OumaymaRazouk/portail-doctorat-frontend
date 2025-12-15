import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  template: `
  <div class="auth-container">
    <div class="card">
      <div class="register-header">
        <h1 class="register-title">Créer un compte</h1>
        <p class="register-subtitle">Rejoignez le portail doctorat</p>
      </div>
      
      <form (ngSubmit)="onRegister()" class="register-form">
        <div class="form-group">
          <label for="firstName">Prénom</label>
          <input 
            id="firstName"
            [(ngModel)]="form.firstName" 
            name="firstName" 
            class="form-input" 
            placeholder="Votre prénom" 
            required>
        </div>
        
        <div class="form-group">
          <label for="lastName">Nom</label>
          <input 
            id="lastName"
            [(ngModel)]="form.lastName" 
            name="lastName" 
            class="form-input" 
            placeholder="Votre nom" 
            required>
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input 
            id="email"
            [(ngModel)]="form.email" 
            name="email" 
            type="email"
            class="form-input" 
            placeholder="votre.email@exemple.com" 
            required>
        </div>
        
        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input 
            id="password"
            [(ngModel)]="form.password" 
            name="password" 
            type="password" 
            class="form-input" 
            placeholder="••••••••" 
            required>
        </div>
        
        <div class="form-group">
          <label for="roles">Type de compte</label>
          <select id="roles" [(ngModel)]="form.roles" name="roles" class="form-input">
            <option [ngValue]="['DOCTORANT']">Doctorant</option>
            <option [ngValue]="['DIRECTEUR']">Directeur de thèse</option>
            <option [ngValue]="['PERSONNEL_ADMINISTRATIF']">Personnel administratif</option>
            <option [ngValue]="['SUPERADMIN']">Super Admin</option>
          </select>
        </div>
        
        <button type="submit" class="btn-register">Créer mon compte</button>
      </form>
      
      <div class="register-footer">
        <p>
          Déjà inscrit ? 
          <a routerLink="/login" class="login-link">Se connecter</a>
        </p>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .auth-container { 
      display: flex; 
      justify-content: center; 
      align-items: center; 
      min-height: 100vh; 
      background: var(--background);
      padding: 24px;
    }
    
    .card { 
      width: 100%; 
      max-width: 480px; 
      border-radius: 18px;
      background: var(--card-bg);
      padding: 1.75rem 2rem;
      box-shadow: var(--shadow-soft);
    }
    
    .register-header {
      text-align: center;
      margin-bottom: 1.25rem;
    }
    
    .register-title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f172a;
      margin: 0 0 0.35rem;
    }
    
    .register-subtitle {
      font-size: 0.9rem;
      color: #64748b;
      margin: 0;
    }
    
    .register-form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    
    .form-group label {
      font-size: 0.85rem;
      font-weight: 500;
      color: #4b5563;
    }
    
    .form-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid var(--border-color);
      border-radius: 10px;
      font-size: 0.9rem;
      outline: none;
      background: #ffffff;
    }
    
    .form-input:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.12);
    }
    
    .btn-register {
      width: 100%;
      padding: 0.75rem 1.25rem;
      background: var(--primary);
      color: var(--primary-foreground);
      border: none;
      border-radius: 999px;
      font-size: 0.95rem;
      font-weight: 500;
      cursor: pointer;
      margin-top: 0.5rem;
      transition: background-color 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease;
    }
    
    .btn-register:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(15, 23, 42, 0.18);
    }
    
    .register-footer {
      text-align: center;
      margin-top: 1.25rem;
      padding-top: 1rem;
      border-top: 1px solid #e5e7eb;
    }
    
    .register-footer p {
      font-size: 0.85rem;
      color: #6b7280;
      margin: 0;
    }
    
    .login-link {
      color: var(--primary);
      text-decoration: none;
      font-weight: 500;
    }
    
    .login-link:hover {
      text-decoration: underline;
    }
  `]
})
export class RegisterComponent {
  form = { firstName: '', lastName: '', email: '', password: '', roles: ['DOCTORANT'] };

  constructor(private auth: AuthService, private router: Router) {}

  onRegister() {
    this.auth.register(this.form).subscribe({
      next: () => {
        alert('Compte créé avec succès !');
        this.router.navigateByUrl('/login');
      },
      error: () => alert('Erreur lors de la création du compte.')
    });
  }
}
