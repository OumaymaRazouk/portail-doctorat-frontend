import { Component } from '@angular/core';
import { LayoutComponent } from '../components/layout.component';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InscriptionService, InscriptionDTO, InscriptionStatus } from '../../core/services/inscription.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-doctorant-dashboard',
  standalone: true,
  imports: [LayoutComponent, RouterLink, CommonModule],
  template: `
    <app-layout title="Espace Doctorant">
      <div class="actions">
        <a routerLink="/inscriptions/nouvelle" class="btn">Nouvelle inscription</a>
        <a routerLink="/reinscriptions/nouvelle" class="btn secondary">Nouvelle réinscription</a>
      </div>

      <h3>Mes demandes</h3>
      <div *ngIf="loading">Chargement...</div>
      <div *ngIf="!loading && inscriptions.length === 0">Aucune demande.</div>
      <table *ngIf="!loading && inscriptions.length > 0" class="table">
        <thead>
          <tr>
            <th>Type</th>
            <th>Année</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let i of inscriptions">
            <td>{{ i.type || 'INSCRIPTION' }}</td>
            <td>{{ i.anneeAcademique }}</td>
            <td><span class="badge" [class.ok]="i.status==='VALIDE'" [class.warn]="i.status==='EN_ATTENTE_ADMIN' || i.status==='EN_ATTENTE_DIRECTEUR'" [class.err]="i.status==='REJETE'">{{ i.status }}</span></td>
            <td>
              <button class="btn small" (click)="submit(i)" *ngIf="i.status==='BROUILLON'">Soumettre</button>
            </td>
          </tr>
        </tbody>
      </table>
    </app-layout>
  `,
  styles: [`
    .actions { display:flex; gap:8px; margin-bottom: 16px; }
    .btn { background:#4f46e5; color:#fff; padding:8px 12px; border-radius:8px; text-decoration:none; }
    .btn.secondary { background:#0ea5e9; }
    .btn.small { padding:6px 10px; font-size: 13px; }
    .table { width:100%; border-collapse:collapse; background:#fff; border:1px solid #e5e7eb; border-radius:8px; overflow:hidden; }
    th, td { padding:10px 12px; border-bottom:1px solid #e5e7eb; }
    th { background:#f9fafb; text-align:left; font-weight:600; }
    .badge { padding:4px 8px; border-radius:6px; background:#e5e7eb; font-size:12px; }
    .badge.ok { background:#dcfce7; color:#166534; }
    .badge.warn { background:#fef9c3; color:#854d0e; }
    .badge.err { background:#fee2e2; color:#991b1b; }
  `]
})
export class DoctorantDashboardComponent {
  inscriptions: (InscriptionDTO & { type?: 'INSCRIPTION'|'REINSCRIPTION' })[] = [];
  loading = false;

  constructor(private service: InscriptionService, private auth: AuthService) {
    this.load();
  }

  private load() {
    this.loading = true;
    this.auth.me().subscribe({
      next: me => {
        this.service.listByDoctorant(me.id).subscribe({
          next: list => { this.inscriptions = list; this.loading = false; },
          error: () => { this.loading = false; }
        })
      },
      error: () => { this.loading = false; }
    })
  }

  submit(i: InscriptionDTO) {
    if (!i.id) return;
    this.service.submit(i.id).subscribe({
      next: () => this.load(),
      error: err => console.error(err)
    })
  }
}
