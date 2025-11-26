import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../components/layout.component';
import { InscriptionService } from '../../core/services/inscription.service';

@Component({
  selector: 'app-encadrant-dashboard',
  standalone: true,
  imports: [
    LayoutComponent, CommonModule, FormsModule
  ],
  template: `
    <app-layout title="Espace Encadrant">
      <div class="card">
        <h3>Actions rapides</h3>
        <div class="row">
          <input [(ngModel)]="inscriptionId" placeholder="ID inscription..." />
          <button class="btn" (click)="approve()" [disabled]="loading || !inscriptionId">Valider (Encadrant)</button>
          <button class="btn" (click)="reject()" [disabled]="loading || !inscriptionId">Rejeter</button>
        </div>
        <div *ngIf="message">{{ message }}</div>
        <div *ngIf="error">{{ error }}</div>
      </div>
    </app-layout>
  `
})
export class EncadrantDashboardComponent {
  inscriptionId = '';
  loading = false;
  message = '';
  error = '';

  constructor(private service: InscriptionService) {}

  approve() {
    if (!this.inscriptionId) return;
    this.loading = true; this.message = ''; this.error = '';
    this.service.directorApprove(this.inscriptionId).subscribe({
      next: () => { this.loading = false; this.message = 'Demande validée par l\'encadrant.'; },
      error: (e) => { this.loading = false; this.error = e?.error?.message || 'Erreur'; }
    });
  }

  reject() {
    if (!this.inscriptionId) return;
    this.loading = true; this.message = ''; this.error = '';
    this.service.reject(this.inscriptionId).subscribe({
      next: () => { this.loading = false; this.message = 'Demande rejetée.'; },
      error: (e) => { this.loading = false; this.error = e?.error?.message || 'Erreur'; }
    });
  }
}
