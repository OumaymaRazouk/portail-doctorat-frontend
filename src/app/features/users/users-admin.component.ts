import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../components/layout.component';
import { UsersService, SimpleUser } from '../../core/services/users.service';
import { SoutenanceService, PrerequisConfigInput, PrerequisSoutenanceConfig } from '../../core/services/soutenance.service';

type UserTab = 'candidats' | 'directeurs' | 'doctorants';

@Component({
  selector: 'app-users-admin',
  standalone: true,
  imports: [LayoutComponent, CommonModule, FormsModule],
  template: `
    <app-layout title="Gestion des Utilisateurs">
      <div class="hero">
        <div class="hero-text">
          <h2>Gestion des Utilisateurs</h2>
          <p>Gérez les candidatures, directeurs et doctorants.</p>
        </div>
        <button type="button" class="btn-refresh" (click)="reload()" [disabled]="loading || saving">
          Actualiser
        </button>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-label">Candidatures</div>
          <div class="stat-value">{{ candidatsCount }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Directeurs</div>
          <div class="stat-value">{{ directeursCount }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Doctorants</div>
          <div class="stat-value">{{ doctorantsCount }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total</div>
          <div class="stat-value">{{ totalUsers }}</div>
        </div>
      </div>

      <div class="tabs">
        <button type="button" class="tab" [class.active]="activeTab==='candidats'" (click)="setTab('candidats')">
          Candidatures
        </button>
        <button type="button" class="tab" [class.active]="activeTab==='directeurs'" (click)="setTab('directeurs')">
          Directeurs
        </button>
        <button type="button" class="tab" [class.active]="activeTab==='doctorants'" (click)="setTab('doctorants')">
          Doctorants
        </button>
      </div>

      <div *ngIf="activeTab==='doctorants'">
        <div class="card">
          <div class="card-header">
            <div>
              <h3>Liste des Doctorants</h3>
              <span class="hint">Cliquez sur un doctorant pour modifier ses prérequis</span>
            </div>
          </div>

          <div *ngIf="loading" class="info">Chargement des doctorants...</div>
          <table class="table" *ngIf="!loading && doctorants.length > 0">
            <thead>
              <tr>
                <th>Doctorant</th>
                <th>Email</th>
                <th>Identifiant</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let d of doctorants" (click)="onSelectDoctorant(d)" [class.selected]="selectedDoctorant?.id === d.id">
                <td>{{ d.firstName }} {{ d.lastName }}</td>
                <td>{{ d.email }}</td>
                <td>{{ d.id }}</td>
              </tr>
            </tbody>
          </table>
          <div *ngIf="!loading && doctorants.length === 0" class="info">Aucun doctorant trouvé.</div>
        </div>

        <div class="card" *ngIf="selectedDoctorant">
          <div class="card-header">
            <div>
              <h3>Modifier les prérequis de {{ selectedDoctorant.firstName }} {{ selectedDoctorant.lastName }}</h3>
              <span class="hint">Ces informations seront utilisées pour vérifier les demandes de soutenance.</span>
            </div>
          </div>

          <div *ngIf="prereqLoading" class="info">Chargement des prérequis...</div>

          <ng-container *ngIf="!prereqLoading && prereqForm">
            <div class="grid">
              <div class="field">
                <label>Publications Q1/Q2 (minimum)</label>
                <input type="number" min="0" class="input" [(ngModel)]="prereqForm.minPublications" name="minPublications" />
              </div>
              <div class="field">
                <label>Communications / conférences (minimum)</label>
                <input type="number" min="0" class="input" [(ngModel)]="prereqForm.minCommunications" name="minCommunications" />
              </div>
              <div class="field">
                <label>Heures de formation doctorale (minimum)</label>
                <input type="number" min="0" class="input" [(ngModel)]="prereqForm.minHeuresFormation" name="minHeuresFormation" />
              </div>
              <div class="field">
                <label>Durée maximale du doctorat (années)</label>
                <input type="number" min="1" class="input" [(ngModel)]="prereqForm.maxDureeAnnees" name="maxDureeAnnees" />
              </div>
            </div>

            <div class="grid grid-docs">
              <div class="checkbox-field">
                <label>
                  <input type="checkbox" [(ngModel)]="prereqForm.requireManuscrit" name="requireManuscrit" />
                  Manuscrit final obligatoire
                </label>
              </div>
              <div class="checkbox-field">
                <label>
                  <input type="checkbox" [(ngModel)]="prereqForm.requireAntiPlagiat" name="requireAntiPlagiat" />
                  Rapport anti-plagiat obligatoire
                </label>
              </div>
              <div class="checkbox-field">
                <label>
                  <input type="checkbox" [(ngModel)]="prereqForm.requireAttestations" name="requireAttestations" />
                  Attestations de formations obligatoires
                </label>
              </div>
              <div class="checkbox-field">
                <label>
                  <input type="checkbox" [(ngModel)]="prereqForm.requireDemandeManuscrite" name="requireDemandeManuscrite" />
                  Demande manuscrite obligatoire
                </label>
              </div>
            </div>

            <div class="actions">
              <button type="button" class="btn secondary" (click)="resetPrerequis()" [disabled]="saving || !selectedDoctorant">
                Annuler
              </button>
              <button type="button" class="btn primary" (click)="onSavePrerequis()" [disabled]="saving || !prereqForm">
                Enregistrer
              </button>
            </div>

            <div class="err" *ngIf="error">{{ error }}</div>
            <div class="msg" *ngIf="success">{{ success }}</div>
          </ng-container>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .hero {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      border-radius: 16px;
      background: linear-gradient(90deg, #1d4ed8, #4f46e5);
      color: #f9fafb;
      margin-bottom: 1.25rem;
    }

    .hero-text h2 {
      margin: 0;
      font-size: 1.4rem;
      font-weight: 600;
    }

    .hero-text p {
      margin: 0.2rem 0 0 0;
      font-size: 0.9rem;
      opacity: 0.9;
    }

    .btn-refresh {
      background: #f9fafb;
      color: #1f2937;
      border-radius: 999px;
      border: none;
      padding: 0.4rem 0.9rem;
      font-size: 0.85rem;
      cursor: pointer;
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 0.75rem;
      margin-bottom: 1.25rem;
    }

    .stat-card {
      background: #ffffff;
      border-radius: 12px;
      padding: 0.75rem 1rem;
      box-shadow: 0 4px 10px rgba(15, 23, 42, 0.06);
    }

    .stat-label {
      font-size: 0.8rem;
      color: #6b7280;
      margin-bottom: 0.25rem;
    }

    .stat-value {
      font-size: 1.2rem;
      font-weight: 600;
      color: #111827;
    }

    .tabs {
      display: inline-flex;
      border-radius: 999px;
      background: #e5e7eb;
      padding: 0.15rem;
      margin-bottom: 1rem;
    }

    .tab {
      border: none;
      background: transparent;
      padding: 0.4rem 0.9rem;
      border-radius: 999px;
      font-size: 0.85rem;
      cursor: pointer;
      color: #4b5563;
    }

    .tab.active {
      background: #ffffff;
      color: #111827;
      box-shadow: 0 2px 6px rgba(15, 23, 42, 0.12);
      font-weight: 600;
    }

    .card {
      background: #ffffff;
      border-radius: 12px;
      padding: 1rem 1.25rem;
      box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
      margin-bottom: 1rem;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 0.75rem;
    }

    .hint {
      font-size: 0.8rem;
      color: #6b7280;
    }

    .table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 0.5rem 0.75rem;
      border-bottom: 1px solid #e5e7eb;
      text-align: left;
      font-size: 0.85rem;
    }

    tr.selected {
      background: #eff6ff;
    }

    tr:hover {
      background: #f9fafb;
      cursor: pointer;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 0.75rem 1.25rem;
      margin-bottom: 0.75rem;
    }

    .field label {
      display: block;
      font-size: 0.8rem;
      color: #4b5563;
      margin-bottom: 0.2rem;
    }

    .input {
      width: 100%;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      padding: 0.4rem 0.6rem;
      font-size: 0.85rem;
    }

    .grid-docs {
      margin-top: 0.5rem;
    }

    .checkbox-field label {
      font-size: 0.85rem;
      color: #374151;
    }

    .checkbox-field input {
      margin-right: 0.35rem;
    }

    .actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.75rem;
    }

    .btn {
      border-radius: 999px;
      border: none;
      padding: 0.4rem 0.9rem;
      font-size: 0.85rem;
      cursor: pointer;
    }

    .btn.primary {
      background: #4f46e5;
      color: #ffffff;
    }

    .btn.secondary {
      background: #e5e7eb;
      color: #111827;
    }

    .info {
      font-size: 0.85rem;
      color: #4b5563;
    }

    .err {
      margin-top: 0.5rem;
      font-size: 0.85rem;
      color: #b91c1c;
    }

    .msg {
      margin-top: 0.5rem;
      font-size: 0.85rem;
      color: #166534;
    }
  `]
})
export class UsersAdminComponent {
  candidats: SimpleUser[] = [];
  directeurs: SimpleUser[] = [];
  doctorants: SimpleUser[] = [];

  activeTab: UserTab = 'doctorants';

  selectedDoctorant: SimpleUser | null = null;
  prereqForm: PrerequisConfigInput | null = null;

  loading = false;
  prereqLoading = false;
  saving = false;
  error = '';
  success = '';

  constructor(private users: UsersService, private soutenance: SoutenanceService) {
    this.reload();
  }

  get candidatsCount(): number {
    return this.candidats.length;
  }

  get directeursCount(): number {
    return this.directeurs.length;
  }

  get doctorantsCount(): number {
    return this.doctorants.length;
  }

  get totalUsers(): number {
    return this.candidats.length + this.directeurs.length + this.doctorants.length;
  }

  setTab(tab: UserTab) {
    this.activeTab = tab;
  }

  reload() {
    this.loading = true;
    this.error = '';
    this.success = '';

    this.users.listCandidats().subscribe({
      next: list => {
        this.candidats = list || [];
      },
      error: () => {}
    });

    this.users.listEncadrants().subscribe({
      next: list => {
        this.directeurs = list || [];
      },
      error: () => {}
    });

    this.users.listDoctorants().subscribe({
      next: list => {
        this.doctorants = list || [];
        this.loading = false;
        if (!this.selectedDoctorant && this.doctorants.length > 0) {
          this.onSelectDoctorant(this.doctorants[0]);
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Erreur lors du chargement des doctorants.';
      }
    });
  }

  private defaultPrerequis(doctorantId: string): PrerequisConfigInput {
    return {
      doctorantId,
      minPublications: 2,
      minCommunications: 2,
      minHeuresFormation: 200,
      maxDureeAnnees: 6,
      requireManuscrit: true,
      requireAntiPlagiat: true,
      requireAttestations: true,
      requireDemandeManuscrite: true
    };
  }

  onSelectDoctorant(user: SimpleUser) {
    this.selectedDoctorant = user;
    this.prereqLoading = true;
    this.error = '';
    this.success = '';

    const doctorantId = user.id;

    this.soutenance.getPrerequisConfig(doctorantId).subscribe({
      next: res => {
        const cfg: PrerequisSoutenanceConfig | null = res.data?.prerequisConfigForDoctorant ?? null;
        if (cfg) {
          this.prereqForm = {
            doctorantId: cfg.doctorantId,
            minPublications: cfg.minPublications,
            minCommunications: cfg.minCommunications,
            minHeuresFormation: cfg.minHeuresFormation,
            maxDureeAnnees: cfg.maxDureeAnnees,
            requireManuscrit: cfg.requireManuscrit,
            requireAntiPlagiat: cfg.requireAntiPlagiat,
            requireAttestations: cfg.requireAttestations,
            requireDemandeManuscrite: cfg.requireDemandeManuscrite
          };
        } else {
          this.prereqForm = this.defaultPrerequis(doctorantId);
        }
        this.prereqLoading = false;
      },
      error: () => {
        this.prereqForm = this.defaultPrerequis(doctorantId);
        this.prereqLoading = false;
        this.error = 'Erreur lors du chargement des prérequis.';
      }
    });
  }

  resetPrerequis() {
    if (this.selectedDoctorant) {
      this.onSelectDoctorant(this.selectedDoctorant);
    }
  }

  onSavePrerequis() {
    if (!this.selectedDoctorant || !this.prereqForm) {
      return;
    }
    this.saving = true;
    this.error = '';
    this.success = '';

    const input: PrerequisConfigInput = {
      ...this.prereqForm,
      doctorantId: this.selectedDoctorant.id
    };

    this.soutenance.savePrerequisConfig(input).subscribe({
      next: res => {
        this.saving = false;
        if (res.errors && res.errors.length > 0) {
          this.error = res.errors[0].message;
          return;
        }
        this.success = 'Prérequis enregistrés.';
        this.prereqForm = input;
      },
      error: () => {
        this.saving = false;
        this.error = "Erreur lors de l'enregistrement des prérequis.";
      }
    });
  }
}
