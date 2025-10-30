import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  form = { email: '', password: '' };
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  rememberMe = false;

  constructor(private auth: AuthService, private router: Router) {
    console.log('LoginComponent loaded');
  }

  onLogin() {
    if (!this.form.email || !this.form.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.auth.login(this.form).subscribe({
      next: (res) => {
        this.auth.saveTokens(res);
        const roles = this.auth.rolesFromJwt;
        
        // Redirect based on role
        if (roles.includes('SUPER_ADMIN')) {
          this.router.navigateByUrl('/dashboard/super-admin');
        } else if (roles.includes('ADMIN')) {
          this.router.navigateByUrl('/dashboard/admin');
        } else if (roles.includes('ENCADRANT')) {
          this.router.navigateByUrl('/dashboard/encadrant');
        } else {
          this.router.navigateByUrl('/dashboard/doctorant');
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Email ou mot de passe incorrect';
        console.error('Login error:', err);
      }
    });
  }
}
