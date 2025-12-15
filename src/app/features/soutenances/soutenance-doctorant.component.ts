import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../components/layout.component';
import { AuthService } from '../../core/services/auth.service';
import { UsersService, SimpleUser } from '../../core/services/users.service';
import { SoutenanceService, SoutenanceDTO, SoutenanceDraftInput } from '../../core/services/soutenance.service';

@Component({
  selector: 'app-soutenance-doctorant',
  standalone: true,
  imports: [LayoutComponent, CommonModule, FormsModule],
  template: `
    <app-layout title="Ma soutenance">
      <div *ngIf="loading" class="info">Chargement...</div>

      <div *ngIf="!loading" class="content-wrapper">
        <div class="card" *ngIf="soutenances.length > 0">
          <h4>Mes soutenances</h4>
          <table class="table">
            <thead>
              <tr>
                <th>Doctorant</th>
                <th>Statut</th>
                <th>Date soumission</th>
                <th>Date planifiée</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of soutenances" (click)="selectSoutenance(s)" class="row-clickable">
                <td>{{ s.doctorantId }}</td>
                <td><span class="badge" [ngClass]="statusClass(s.status)">{{ s.status }}</span></td>
                <td>{{ s.dateSoumission ? (s.dateSoumission | date:'short') : '-' }}</td>
                <td>{{ s.datePlanifiee ? (s.datePlanifiee | date:'short') : '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="status-card" *ngIf="current">
          <h4>Statut de ma soutenance</h4>
          <p>
            <span class="badge" [ngClass]="statusClass(current.status)">
              {{ current.status }}
            </span>
          </p>
          <p *ngIf="current.dateSoumission">Soumise le : {{ current.dateSoumission | date:'short' }}</p>
          <p *ngIf="current.datePlanifiee">Planifiée le : {{ current.datePlanifiee | date:'short' }}</p>
        </div>

        <div class="card">
          <h4>Préparation du dossier scientifique</h4>

          <form (ngSubmit)="onSaveDraft()" class="form" *ngIf="doctorantId">
            <div class="row">
              <label for="directeurId">Directeur de thèse</label>
              <select id="directeurId" name="directeurId" [(ngModel)]="form.directeurId" required class="input">
                <option value="" disabled>-- Sélectionner un encadrant --</option>
                <option *ngFor="let e of encadrants" [value]="e.id">
                  {{ e.firstName }} {{ e.lastName }} ({{ e.email }})
                </option>
              </select>
            </div>

            <div class="row">
              <label for="titre">Titre définitif de la thèse</label>
              <input id="titre" name="titre" [(ngModel)]="form.titreTheseDefinitif" required class="input" />
            </div>

            <div class="row">
              <label for="resume">Résumé final</label>
              <textarea id="resume" name="resume" [(ngModel)]="form.resumeFinal" rows="4" class="input" required></textarea>
            </div>

            <div class="row">
              <label for="motsCles">Mots-clés (séparés par des virgules)</label>
              <input id="motsCles" name="motsCles" [(ngModel)]="motsClesText" class="input" />
            </div>

            <div class="grid">
              <div class="row">
                <label for="pubs">Nombre de publications (Q1/Q2)</label>
                <input id="pubs" name="pubs" type="number" min="0" [(ngModel)]="form.publicationsCount" class="input" />
              </div>
              <div class="row">
                <label for="comms">Nombre de communications</label>
                <input id="comms" name="comms" type="number" min="0" [(ngModel)]="form.communicationsCount" class="input" />
              </div>
            </div>

            <div class="grid">
              <div class="row">
                <label for="heures">Heures de formation cumulées</label>
                <input id="heures" name="heures" type="number" min="0" [(ngModel)]="form.heuresFormationCumulees" class="input" />
              </div>
              <div class="row">
                <label for="duree">Durée du doctorat (années)</label>
                <input id="duree" name="duree" type="number" min="1" [(ngModel)]="form.dureeDoctoratAnnees" class="input" />
              </div>
            </div>

            <div class="actions">
              <button type="submit" class="btn" [disabled]="saving">
                {{ current ? 'Mettre à jour le brouillon' : 'Enregistrer le brouillon' }}
              </button>
              <button type="button" class="btn secondary" (click)="onSubmit()" [disabled]="submitting || !current || current.status !== 'BROUILLON'">
                Soumettre la soutenance
              </button>
            </div>

            <div *ngIf="errorMessage" class="error">{{ errorMessage }}</div>
            <div *ngIf="successMessage" class="success">{{ successMessage }}</div>
          </form>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .content-wrapper {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .card, .status-card {
      background: #fff;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
    }
    .status-card h4 { margin-top: 0; }
    .form { display: flex; flex-direction: column; gap: 12px; }
    .row { display: flex; flex-direction: column; gap: 6px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
    label { font-size: 13px; color: #4a5568; }
    .input { padding: 8px 10px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 14px; }
    .btn { background:#4f46e5; color:#fff; padding:8px 12px; border-radius:8px; border:0; cursor:pointer; }
    .btn.secondary { background:#0ea5e9; }
    .actions { display:flex; gap:8px; margin-top:8px; }
    .badge { padding:4px 8px; border-radius:6px; background:#e5e7eb; font-size:12px; }
    .badge.ok { background:#dcfce7; color:#166534; }
    .badge.warn { background:#fef9c3; color:#854d0e; }
    .badge.err { background:#fee2e2; color:#991b1b; }
    .table { width:100%; border-collapse:collapse; margin-top:8px; }
    th, td { padding:8px 10px; border-bottom:1px solid #e5e7eb; text-align:left; }
    .row-clickable { cursor:pointer; }
    .row-clickable:hover { background:#f9fafb; }
    .error { margin-top:8px; color:#b91c1c; font-size:13px; }
    .success { margin-top:8px; color:#166534; font-size:13px; }
    .info { font-size: 14px; }
  `]
})
export class SoutenanceDoctorantComponent {
  doctorantId: string | null = null;
  soutenances: SoutenanceDTO[] = [];
  encadrants: SimpleUser[] = [];
  current: SoutenanceDTO | null = null;
  selected: SoutenanceDTO | null = null;
  loading = false;
  saving = false;
  submitting = false;
  errorMessage = '';
  successMessage = '';

  motsClesText = '';

  form: SoutenanceDraftInput & { directeurId: string } = {
    doctorantId: '',
    directeurId: '',
    titreTheseDefinitif: '',
    resumeFinal: '',
    motsCles: [],
    publicationsCount: 0,
    communicationsCount: 0,
    heuresFormationCumulees: 0,
    dureeDoctoratAnnees: 3
  };

  constructor(
    private auth: AuthService,
    private users: UsersService,
    private soutenance: SoutenanceService
  ) {
    this.bootstrap();
  }

  private bootstrap() {
    this.loading = true;
    this.auth.me().subscribe({
      next: (me) => {
        this.doctorantId = me.id;
        this.form.doctorantId = me.id;
        this.loadSoutenances();
      },
      error: () => {
        this.loading = false;
      }
    });

    this.users.listEncadrants().subscribe({
      next: (list) => (this.encadrants = list),
      error: () => console.warn('Impossible de charger les encadrants')
    });
  }

  private loadSoutenances() {
    if (!this.doctorantId) { this.loading = false; return; }
    this.soutenance.listForDoctorant(this.doctorantId).subscribe({
      next: (res) => {
        const list = res.data?.soutenancesForDoctorant || [];
        this.soutenances = list;
        this.current = list.find(s => s.status === 'BROUILLON') || (list.length > 0 ? list[0] : null);
        this.selected = this.current;
        if (this.current) {
          this.form = {
            doctorantId: this.current.doctorantId,
            directeurId: this.current.directeurId,
            titreTheseDefinitif: this.current.titreTheseDefinitif || '',
            resumeFinal: this.current.resumeFinal || '',
            motsCles: this.current.motsCles || [],
            publicationsCount: this.current.publicationsCount,
            communicationsCount: this.current.communicationsCount,
            heuresFormationCumulees: this.current.heuresFormationCumulees,
            dureeDoctoratAnnees: this.current.dureeDoctoratAnnees
          };
          this.motsClesText = (this.form.motsCles || []).join(', ');
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  onSaveDraft() {
    if (!this.doctorantId) return;
    this.errorMessage = '';
    this.successMessage = '';
    this.saving = true;

    const rawMots = this.motsClesText || '';
    const motsClesList = rawMots
      .split(',')
      .map(m => m.trim())
      .filter(m => m.length > 0);

    const input: SoutenanceDraftInput = {
      doctorantId: this.form.doctorantId,
      directeurId: this.form.directeurId,
      titreTheseDefinitif: this.form.titreTheseDefinitif,
      resumeFinal: this.form.resumeFinal,
      motsCles: motsClesList,
      publicationsCount: Number(this.form.publicationsCount || 0),
      communicationsCount: Number(this.form.communicationsCount || 0),
      heuresFormationCumulees: Number(this.form.heuresFormationCumulees || 0),
      dureeDoctoratAnnees: Number(this.form.dureeDoctoratAnnees || 0)
    };
    this.soutenance.saveDraft(input).subscribe({
      next: (res) => {
        this.saving = false;
        if (res.errors && res.errors.length > 0) {
          this.errorMessage = res.errors[0].message;
          return;
        }
        this.current = res.data?.saveSoutenanceDraft || null;
        this.successMessage = 'Brouillon enregistré avec succès';
        this.loadSoutenances();
      },
      error: (err) => {
        console.error(err);
        this.saving = false;
        this.errorMessage = "Erreur lors de l'enregistrement du brouillon";
      }
    });
  }

  onSubmit() {
    if (!this.current) return;
    this.errorMessage = '';
    this.successMessage = '';
    this.submitting = true;
    this.soutenance.submit(this.current.id).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.errors && res.errors.length > 0) {
          this.errorMessage = res.errors[0].message;
          return;
        }
        const updated = res.data?.submitSoutenance;
        if (updated) {
          this.current = updated;
          this.successMessage = 'Soutenance soumise avec succès';
          this.loadSoutenances();
        }
      },
      error: (err) => {
        console.error(err);
        this.submitting = false;
        this.errorMessage = 'Erreur lors de la soumission de la soutenance';
      }
    });
  }

  statusClass(status: string) {
    if (status === 'SOUTENANCE_EFFECTUEE' || status === 'SOUTENANCE_PLANIFIEE' || status === 'JURY_VALIDE' || status === 'SOUTENANCE_AUTORISEE') {
      return 'ok';
    }
    if (status === 'REJETE') {
      return 'err';
    }
    if (status === 'SOUMIS' || status === 'PREREQUIS_EN_VERIFICATION' || status === 'PREREQUIS_VALIDES' || status === 'JURY_PROPOSE') {
      return 'warn';
    }
    return '';
  }

  selectSoutenance(s: SoutenanceDTO) {
    this.selected = s;
  }
}
