import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LayoutComponent } from '../components/layout.component';

@Component({
  selector: 'app-activate-account',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutComponent],
  template: `
    <app-layout title="Activation du compte">
      <div class="card">
        <div class="grid">
          <div class="field">
            <label>Nouveau mot de passe</label>
            <input class="input" type="password" [(ngModel)]="password" />
          </div>
          <div class="field">
            <label>Confirmer le mot de passe</label>
            <input class="input" type="password" [(ngModel)]="confirm" />
          </div>
        </div>
        <div class="actions">
          <button class="btn primary" type="button" (click)="activate()" [disabled]="loading">Activer</button>
        </div>
        <div class="msg" *ngIf="success">{{ success }}</div>
        <div class="err" *ngIf="error">{{ error }}</div>
      </div>
    </app-layout>
  `,
  styles: [`
    .card { background:#fff; border-radius:12px; padding:1rem 1.25rem; box-shadow:0 4px 12px rgba(15,23,42,.06); }
    .grid { display:grid; grid-template-columns: repeat(auto-fit,minmax(240px,1fr)); gap:.75rem 1.25rem; }
    .field label { display:block; font-size:.85rem; margin-bottom:.25rem; color:#374151; }
    .input { width:100%; border:1px solid #e5e7eb; border-radius:8px; padding:.45rem .6rem; font-size:.9rem; }
    .actions { margin-top:.75rem; }
    .btn { border:none; border-radius:999px; padding:.45rem .9rem; font-size:.9rem; cursor:pointer; }
    .btn.primary { background:#4f46e5; color:#fff; }
    .err { margin-top:.5rem; color:#b91c1c; font-size:.9rem; }
    .msg { margin-top:.5rem; color:#166534; font-size:.9rem; }
  `]
})
export class ActivateAccountComponent {
  private router = inject(Router);
  private auth = inject(AuthService);

  password = '';
  confirm = '';
  loading = false;
  error = '';
  success = '';

  private get token(): string {
    const url = new URL(window.location.href);
    return url.searchParams.get('token') || '';
  }

  activate() {
    this.error = '';
    this.success = '';
    if (!this.password || this.password !== this.confirm) {
      this.error = 'Les mots de passe ne correspondent pas.';
      return;
    }
    const token = this.token;
    if (!token) {
      this.error = 'Lien invalide ou manquant.';
      return;
    }
    this.loading = true;
    this.auth.activate({ token, newPassword: this.password }).subscribe({
      next: res => {
        this.loading = false;
        this.auth.saveTokens(res);
        this.success = 'Compte activé avec succès.';
        this.router.navigateByUrl('/dashboard/encadrant');
      },
      error: () => {
        this.loading = false;
        this.error = "Lien d'activation expiré ou invalide.";
      }
    });
  }
}
