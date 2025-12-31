import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../components/layout.component';
import { InscriptionService, InscriptionDTO, InscriptionYearSummary } from '../../core/services/inscription.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    LayoutComponent, CommonModule, FormsModule
  ],
  template: `
    <app-layout title="Espace Administratif">
      <div class="card">
        <h3>Dossiers en attente de validation</h3>
        <div *ngIf="loading">Chargement...</div>
        <div *ngIf="!loading && inscriptions.length === 0">Aucun dossier en attente.</div>
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
                <button class="btn small" (click)="approve(i)" *ngIf="i.status==='EN_ATTENTE_ADMIN'">Valider</button>
                <button class="btn small danger" (click)="reject(i)" *ngIf="i.status==='EN_ATTENTE_ADMIN'">Rejeter</button>
                <button class="btn small secondary" (click)="details(i)">Détails</button>
              </td>
            </tr>
          </tbody>
        </table>
        <div *ngIf="message" class="msg">{{ message }}</div>
        <div *ngIf="error" class="err">{{ error }}</div>
      </div>

      <div class="card">
        <h3>Statistiques des inscriptions par année</h3>
        <div class="filters">
          <label for="yearFilter">Filtrer par année :</label>
          <select id="yearFilter" [(ngModel)]="selectedYear" (change)="onYearChange()">
            <option value="">Toutes</option>
            <option *ngFor="let y of availableYears" [value]="y">{{ y }}</option>
          </select>
        </div>
        <div *ngIf="statsLoading">Chargement...</div>
        <div *ngIf="!statsLoading && statsError" class="err">{{ statsError }}</div>
        <div *ngIf="!statsLoading && !statsError && stats.length === 0">Aucune inscription trouvée.</div>
        <table *ngIf="!statsLoading && !statsError && stats.length > 0" class="table">
          <thead>
            <tr>
              <th>Année académique</th>
              <th>Nombre d'inscriptions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of stats">
              <td>{{ s.anneeAcademique }}</td>
              <td>{{ s.total }}</td>
              <td>
                <button class="btn small secondary" (click)="showDetails(s); $event.stopPropagation()">Voir détails</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card" *ngIf="detailsInscriptions.length > 0">
        <h3>Dossiers détaillés pour {{ detailsYear }}</h3>
        <table class="table">
          <thead>
            <tr>
              <th>Doctorant</th>
              <th>Année</th>
              <th>Statut</th>
              <th>Sujet</th>
              <th>Documents</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let i of detailsInscriptions">
              <td>{{ i.doctorantId }}</td>
              <td>{{ i.anneeAcademique }}</td>
              <td>{{ i.status }}</td>
              <td>{{ i.sujetThese }}</td>
              <td>
                <button class="btn small secondary" type="button" (click)="downloadRapportParcours(i)">
                  Rapport parcours
                </button>
                <button class="btn small secondary" type="button" style="margin-left: 0.4rem" (click)="downloadTableauSuiviForDoctorant(i)">
                  Tableau de suivi
                </button>
              </td>
            </tr>
          </tbody>
        </table>
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

    .filters {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.75rem;
      font-size: 0.9rem;
    }

    .filters select {
      border-radius: 999px;
      border: 1px solid var(--border-color);
      padding: 0.25rem 0.75rem;
      font-size: 0.85rem;
    }

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

    .actions-docs {
      margin-top: 0.75rem;
    }
  `]
})
export class AdminDashboardComponent {
  inscriptions: InscriptionDTO[] = [];
  loading = false;
  message = '';
  error = '';

  stats: InscriptionYearSummary[] = [];
  statsLoading = false;
  statsError = '';
  availableYears: string[] = [];
  selectedYear = '';

  detailsYear = '';
  detailsInscriptions: InscriptionDTO[] = [];

  constructor(private service: InscriptionService, private router: Router) {
    this.load();
    this.loadStats();
  }

  private load() {
    this.loading = true; this.message = ''; this.error = '';
    this.service.listPendingForAdmin().subscribe({
      next: list => { this.inscriptions = list; this.loading = false; },
      error: e => { this.loading = false; this.error = e?.error?.message || 'Erreur'; }
    });
  }

  private loadStats(annee?: string) {
    this.statsLoading = true; this.statsError = '';
    this.service.getStatsByYear(annee).subscribe({
      next: list => {
        this.stats = list;
        this.statsLoading = false;
        if (!annee) {
          this.availableYears = Array.from(new Set(list.map(s => s.anneeAcademique)));
        }
      },
      error: () => { this.statsLoading = false; this.statsError = 'Erreur lors du chargement des statistiques.'; }
    });
  }

  onYearChange() {
    const value = this.selectedYear || undefined;
    this.loadStats(value);
  }

  showDetails(s: InscriptionYearSummary) {
    this.detailsYear = s.anneeAcademique;
    this.detailsInscriptions = s.inscriptions || [];
  }

  approve(i: InscriptionDTO) {
    if (!i.id) return;
    this.loading = true; this.message = ''; this.error = '';
    this.service.adminApprove(i.id).subscribe({
      next: () => { this.loading = false; this.message = "Demande validée par l'administration."; this.load(); },
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

  downloadRapportParcours(i: InscriptionDTO) {
    if (!i.doctorantId) return;
    this.service.downloadRapportParcours(i.doctorantId).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport-parcours-${i.doctorantId}.pdf`;
      a.target = '_blank';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  downloadTableauSuivi() {
    this.service.downloadTableauSuivi().subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tableau-suivi-documentation.pdf';
      a.target = '_blank';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
  
  downloadTableauSuiviForDoctorant(i: InscriptionDTO) {
    if (!i.doctorantId) return;
    this.service.downloadTableauSuiviForDoctorant(i.doctorantId).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tableau-suivi-documentation-${i.doctorantId}.pdf`;
      a.target = '_blank';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
