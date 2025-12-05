import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../components/layout.component';
import { InscriptionService, InscriptionDTO } from '../../core/services/inscription.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-encadrant-dashboard',
  standalone: true,
  imports: [
    LayoutComponent, CommonModule, FormsModule
  ],
  template: `
    <app-layout title="Espace Encadrant">
      <div class="card">
        <h3>Mes dossiers à traiter</h3>
        <div *ngIf="loading">Chargement...</div>
        <div *ngIf="!loading && inscriptions.length === 0">Aucun dossier à traiter.</div>
        <table *ngIf="!loading && inscriptions.length > 0" class="table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Doctorant</th>
              <th>Année</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let i of inscriptions">
              <td>{{ i.type || 'INSCRIPTION' }}</td>
              <td>{{ i.doctorantId }}</td>
              <td>{{ i.anneeAcademique }}</td>
              <td><span class="badge" [class.ok]="i.status==='VALIDE'" [class.warn]="i.status==='EN_ATTENTE_ADMIN' || i.status==='EN_ATTENTE_DIRECTEUR'" [class.err]="i.status==='REJETE'">{{ i.status }}</span></td>
              <td>
                <button class="btn small" (click)="approve(i)" *ngIf="i.status==='EN_ATTENTE_DIRECTEUR'">Valider</button>
                <button class="btn small danger" (click)="reject(i)" *ngIf="i.status==='EN_ATTENTE_DIRECTEUR'">Rejeter</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="message" class="msg">{{ message }}</div>
        <div *ngIf="error" class="err">{{ error }}</div>
      </div>
    </app-layout>
  `
})
export class EncadrantDashboardComponent {
  inscriptions: InscriptionDTO[] = [];
  loading = false;
  message = '';
  error = '';

  constructor(private service: InscriptionService, private auth: AuthService) {
    this.load();
  }

  private load() {
    this.loading = true; this.message = ''; this.error = '';
    this.auth.me().subscribe({
      next: me => {
        this.service.listByDirecteur(me.id).subscribe({
          next: list => { this.inscriptions = list; this.loading = false; },
          error: e => { this.loading = false; this.error = e?.error?.message || 'Erreur'; }
        });
      },
      error: () => { this.loading = false; this.error = 'Impossible de charger le profil encadrant.'; }
    });
  }

  approve(i: InscriptionDTO) {
    if (!i.id) return;
    this.loading = true; this.message = ''; this.error = '';
    this.service.directorApprove(i.id).subscribe({
      next: () => { this.loading = false; this.message = 'Demande validée par l\'encadrant.'; this.load(); },
      error: (e) => { this.loading = false; this.error = e?.error?.message || 'Erreur'; }
    });
  }

  reject(i: InscriptionDTO) {
    if (!i.id) return;
    const motif = prompt('Motif du rejet :');
    if (motif === null) return;
    this.loading = true; this.message = ''; this.error = '';
    this.service.reject(i.id, motif || undefined).subscribe({
      next: () => { this.loading = false; this.message = 'Demande rejetée.'; this.load(); },
      error: (e) => { this.loading = false; this.error = e?.error?.message || 'Erreur'; }
    });
  }
}
