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
            <option [ngValue]="['ENCADRANT']">Encadrant</option>
            <option [ngValue]="['ADMIN']">Administratif</option>
            <option [ngValue]="['SUPER_ADMIN']">Super Admin</option>
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
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    
    .card { 
      width: 90%; 
      max-width: 400px; 
      border-radius: 12px;
      background: white;
      padding: 30px 25px;
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.4);
    }
    
    .register-header {
      text-align: center;
      margin-bottom: 20px;
    }
    
    .register-title {
      font-size: 22px;
      font-weight: 700;
      color: #000000;
      margin: 0 0 6px;
    }
    
    .register-subtitle {
      font-size: 13px;
      color: #666666;
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
      gap: 5px;
    }
    
    .form-group label {
      font-size: 13px;
      font-weight: 600;
      color: #2d3748;
    }
    
    .form-input {
      width: 100%;
      padding: 8px 12px;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 14px;
      outline: none;
    }
    
    .form-input:focus {
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    .btn-register {
      width: 100%;
      padding: 10px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      margin-top: 6px;
      transition: all 0.2s;
    }
    
    .btn-register:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
    }
    
    .register-footer {
      text-align: center;
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
    }
    
    .register-footer p {
      font-size: 13px;
      color: #718096;
      margin: 0;
    }
    
    .login-link {
      color: #667eea;
      text-decoration: none;
      font-weight: 600;
    }
    
    .login-link:hover {
      color: #764ba2;
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
