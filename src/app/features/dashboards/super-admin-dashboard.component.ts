import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from '../components/layout.component';
import { SoutenanceService, WeeklySoutenanceSummary } from '../../core/services/soutenance.service';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [
    LayoutComponent,
    CommonModule
  ],
  template: `
    <app-layout title="Espace Super Admin">
      <p>Bienvenue Super Admin 👑</p>
      <p>Vous pouvez gérer tous les utilisateurs et les rôles.</p>

      <div class="card">
        <h3>Statistiques de soutenances hebdomadaires</h3>
        <div *ngIf="loading">Chargement...</div>
        <div *ngIf="!loading && error" class="err">{{ error }}</div>
        <div *ngIf="!loading && !error && stats.length === 0">Aucune soutenance planifiée sur la période.</div>
        <table *ngIf="!loading && !error && stats.length > 0" class="table">
          <thead>
            <tr>
              <th>Semaine</th>
              <th>Nombre de soutenances planifiées</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let s of stats">
              <td>{{ s.weekStart }} → {{ s.weekEnd }}</td>
              <td>{{ s.total }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </app-layout>
  `
})
export class SuperAdminDashboardComponent {
  stats: WeeklySoutenanceSummary[] = [];
  loading = false;
  error = '';

  constructor(private soutenanceService: SoutenanceService) {
    this.load();
  }

  private load() {
    this.loading = true;
    this.error = '';
    this.soutenanceService.getWeeklyStats().subscribe({
      next: res => {
        this.stats = res;
        this.loading = false;
      },
      error: () => {
        this.error = 'Erreur lors du chargement des statistiques.';
        this.loading = false;
      }
    });
  }
}
