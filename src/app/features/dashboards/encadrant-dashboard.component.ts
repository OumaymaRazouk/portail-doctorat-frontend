import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../components/layout.component';
import { InscriptionService, InscriptionDTO } from '../../core/services/inscription.service';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

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
                <button class="btn small secondary" (click)="details(i)">Détails</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="message" class="msg">{{ message }}</div>
        <div *ngIf="error" class="err">{{ error }}</div>
      </div>
    </app-layout>
  `,
  styles: [`
    .card {
      background: var(--card-bg);
      border-radius: 16px;
      box-shadow: var(--shadow-soft);
      padding: 1.5rem 1.75rem;
      margin-bottom: 1.5rem;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
      background: var(--card-bg);
      border-radius: 12px;
      border: 1px solid var(--border-color);
      overflow: hidden;
    }

    th, td {
      padding: 0.625rem 0.75rem;
      border-bottom: 1px solid var(--border-color);
      font-size: 0.9rem;
    }

    th {
      background: #f9fafb;
      font-weight: 600;
      text-align: left;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      font-size: 0.8rem;
    }

    .btn {
      background: var(--primary);
      color: var(--primary-foreground);
      padding: 0.35rem 0.9rem;
      border-radius: 999px;
      border: none;
      cursor: pointer;
      font-size: 0.8rem;
      font-weight: 500;
      text-decoration: none;
      transition: background-color 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease;
    }

    .btn.small {
      padding: 0.3rem 0.8rem;
      font-size: 0.78rem;
    }

    .btn.secondary { background: var(--info); }
    .btn.danger { background: var(--danger); }

    .btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(15, 23, 42, 0.18);
    }

    .badge {
      display: inline-block;
      padding: 0.2rem 0.7rem;
      border-radius: 999px;
      background: #e5e7eb;
      font-size: 0.7rem;
      font-weight: 500;
    }

    .badge.ok { background:#dcfce7; color:#166534; }
    .badge.warn { background:#fef9c3; color:#854d0e; }
    .badge.err { background:#fee2e2; color:#991b1b; }

    .msg {
      margin-top: 0.5rem;
      font-size: 0.85rem;
      color: #166534;
    }

    .err {
      margin-top: 0.5rem;
      font-size: 0.85rem;
      color: #b91c1c;
    }
  `]
})
export class EncadrantDashboardComponent {
  inscriptions: InscriptionDTO[] = [];
  loading = false;
  message = '';
  error = '';

  constructor(private service: InscriptionService, private auth: AuthService, private router: Router) {
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

  details(i: InscriptionDTO) {
    if (!i.id) return;
    this.router.navigate(['/inscriptions', i.id, 'consultation']);
  }
}
