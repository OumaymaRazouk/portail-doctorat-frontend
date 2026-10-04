import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../components/layout.component';
import { UsersService, SimpleUser } from '../../core/services/users.service';

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

      <div *ngIf="activeTab==='directeurs'">
        <div class="card">
          <div class="card-header">
            <div>
              <h3>Créer un Directeur</h3>
              <span class="hint">Seul le personnel administratif peut créer et activer un compte Directeur.</span>
            </div>
          </div>

          <div class="grid">
            <div class="field">
              <label>Nom</label>
              <input class="input" [(ngModel)]="createForm.lastName" />
            </div>
            <div class="field">
              <label>Prénom</label>
              <input class="input" [(ngModel)]="createForm.firstName" />
            </div>
            <div class="field">
              <label>Email institutionnel</label>
              <input class="input" [(ngModel)]="createForm.email" />
            </div>
            <div class="field">
              <label>Établissement</label>
              <input class="input" [(ngModel)]="createForm.etablissement" />
            </div>
            <div class="field">
              <label>Spécialité / Laboratoire</label>
              <input class="input" [(ngModel)]="createForm.specialite" />
            </div>
          </div>

          <div class="actions">
            <button type="button" class="btn primary" (click)="createDirector()" [disabled]="saving">Créer et générer le lien d'activation</button>
            <button *ngIf="activationLink" type="button" class="btn secondary" (click)="copyLink()">Copier le lien</button>
          </div>
          <div class="msg" *ngIf="activationLink">Lien d'activation: {{ activationLink }}</div>
          <div class="msg" *ngIf="success">{{ success }}</div>
          <div class="err" *ngIf="error">{{ error }}</div>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <h3>Liste des Directeurs</h3>
              <span class="hint">Comptes créés avec rôle DIRECTEUR</span>
            </div>
          </div>
          <div *ngIf="loading" class="info">Chargement des directeurs...</div>
          <table class="table" *ngIf="!loading && directeurs.length > 0">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Identifiant</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let d of directeurs">
                <td>{{ d.firstName }} {{ d.lastName }}</td>
                <td>{{ d.email }}</td>
                <td>{{ d.id }}</td>
              </tr>
            </tbody>
          </table>
          <div *ngIf="!loading && directeurs.length === 0" class="info">Aucun directeur trouvé.</div>
        </div>
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
              <tr *ngFor="let d of doctorants">
                <td>{{ d.firstName }} {{ d.lastName }}</td>
                <td>{{ d.email }}</td>
                <td>{{ d.id }}</td>
              </tr>
            </tbody>
          </table>
          <div *ngIf="!loading && doctorants.length === 0" class="info">Aucun doctorant trouvé.</div>
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
      background: rgba(2, 6, 23, 0.35);
      color: rgba(229, 231, 235, 0.92);
      margin-bottom: 1.25rem;
      border: 1px solid var(--border-color);
      backdrop-filter: blur(14px);
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
      background: rgba(56, 189, 248, 0.20);
      color: rgba(229, 231, 235, 0.92);
      border: 1px solid rgba(56, 189, 248, 0.28);
      border-radius: 999px;
      border: none;
      padding: 0.4rem 0.9rem;
      font-size: 0.85rem;
      cursor: pointer;
    }

    .btn-refresh:hover {
      transform: translateY(-1px);
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);
    }

    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 0.75rem;
      margin-bottom: 1.25rem;
    }

    .stat-card {
      background: var(--card-bg);
      border-radius: 12px;
      padding: 0.75rem 1rem;
      box-shadow: var(--shadow-soft);
      border: 1px solid var(--border-color);
      backdrop-filter: blur(14px);
    }

    .stat-label {
      font-size: 0.8rem;
      color: rgba(229, 231, 235, 0.62);
      margin-bottom: 0.25rem;
    }

    .stat-value {
      font-size: 1.2rem;
      font-weight: 600;
      color: rgba(229, 231, 235, 0.92);
    }

    .tabs {
      display: inline-flex;
      border-radius: 999px;
      background: rgba(2, 6, 23, 0.35);
      padding: 0.15rem;
      margin-bottom: 1rem;
      border: 1px solid var(--border-color);
    }

    .tab {
      border: none;
      background: transparent;
      padding: 0.4rem 0.9rem;
      border-radius: 999px;
      font-size: 0.85rem;
      cursor: pointer;
      color: rgba(229, 231, 235, 0.75);
    }

    .tab.active {
      background: rgba(20, 184, 166, 0.22);
      color: rgba(20, 184, 166, 0.95);
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.28);
      font-weight: 600;
    }

    .card {
      background: var(--card-bg);
      border-radius: 12px;
      padding: 1rem 1.25rem;
      box-shadow: var(--shadow-soft);
      border: 1px solid var(--border-color);
      backdrop-filter: blur(14px);
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
      color: rgba(229, 231, 235, 0.62);
    }

    .table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 0.5rem 0.75rem;
      border-bottom: 1px solid var(--border-color);
      text-align: left;
      font-size: 0.85rem;
    }

    th {
      background: rgba(2, 6, 23, 0.55);
      color: rgba(229, 231, 235, 0.75);
      font-size: 0.82rem;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    td { color: rgba(229, 231, 235, 0.85); }

    tr.selected {
      background: rgba(20, 184, 166, 0.12);
    }

    tr:hover {
      background: rgba(148, 163, 184, 0.06);
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
      color: rgba(229, 231, 235, 0.75);
      margin-bottom: 0.2rem;
    }

    .input {
      width: 100%;
      border-radius: 12px;
      border: 1px solid var(--border-color);
      padding: 0.4rem 0.6rem;
      font-size: 0.85rem;
      background: rgba(2, 6, 23, 0.45);
      color: rgba(229, 231, 235, 0.9);
      outline: none;
    }

    .input:focus {
      border-color: rgba(20, 184, 166, 0.65);
      box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.18);
    }

    .grid-docs {
      margin-top: 0.5rem;
    }

    .checkbox-field label {
      font-size: 0.85rem;
      color: rgba(229, 231, 235, 0.75);
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
      background: var(--primary);
      color: var(--primary-foreground);
    }

    .btn.secondary {
      background: rgba(56, 189, 248, 0.20);
      color: rgba(229, 231, 235, 0.92);
      border: 1px solid rgba(56, 189, 248, 0.28);
    }

    .info {
      font-size: 0.85rem;
      color: rgba(229, 231, 235, 0.62);
    }

    .err {
      margin-top: 0.5rem;
      font-size: 0.85rem;
      color: rgba(239, 68, 68, 0.95);
    }

    .msg {
      margin-top: 0.5rem;
      font-size: 0.85rem;
      color: rgba(34, 197, 94, 0.95);
    }
  `]
})
export class UsersAdminComponent {
  candidats: SimpleUser[] = [];
  directeurs: SimpleUser[] = [];
  doctorants: SimpleUser[] = [];

  activeTab: UserTab = 'doctorants';

  loading = false;
  prereqLoading = false;
  saving = false;
  error = '';
  success = '';

  // Formulaire création de directeur (Option B - lien d'activation)
  createForm = {
    firstName: '',
    lastName: '',
    email: '',
    etablissement: '',
    specialite: ''
  };
  activationLink = '';

  constructor(private users: UsersService) {
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
      },
      error: () => {
        this.loading = false;
        this.error = 'Erreur lors du chargement des doctorants.';
      }
    });
  }

  createDirector() {
    this.error = '';
    this.success = '';
    this.activationLink = '';
    const { firstName, lastName, email } = this.createForm;
    if (!firstName || !lastName || !email) {
      this.error = 'Veuillez remplir nom, prénom et email.';
      return;
    }
    this.saving = true;
    this.users.createDirector(this.createForm).subscribe({
      next: (res: any) => {
        this.saving = false;
        if (res?.success && res.data) {
          const origin = window.location.origin;
          this.activationLink = `${origin}/activate?token=${res.data.activationToken}`;
          this.success = `Directeur créé. Identifiant: ${res.data.identifiant}`;
          this.createForm = { firstName: '', lastName: '', email: '', etablissement: '', specialite: '' };
          this.reload();
        } else {
          this.error = res?.message || 'Création échouée.';
        }
      },
      error: (e: any) => {
        this.saving = false;
        this.error = e?.error?.message || 'Erreur lors de la création.';
      }
    });
  }

  copyLink() {
    if (!this.activationLink) return;
    navigator.clipboard.writeText(this.activationLink).then(() => {
      this.success = 'Lien copié dans le presse-papiers.';
    });
  }
}
