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

  loading = false;
  prereqLoading = false;
  saving = false;
  error = '';
  success = '';

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

}
