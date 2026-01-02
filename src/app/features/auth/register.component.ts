import { Component } from '@angular/core';
 import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  form = { firstName: '', lastName: '', email: '', password: '', roles: ['CANDIDAT'] };
  isLoading = false;
  errorMessage = '';
  showPassword = false;

  constructor(private auth: AuthService, private router: Router) {}

  onRegister() {
    if (!this.form.firstName || !this.form.lastName || !this.form.email || !this.form.password) {
      this.errorMessage = 'Veuillez remplir tous les champs';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.auth.register(this.form).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigateByUrl('/login');
      },
      error: (err) => {
        this.isLoading = false;
        const backendMsg = err?.error?.error || err?.error?.message;
        this.errorMessage = backendMsg || 'Erreur lors de la création du compte.';
      }
    });
  }
}
