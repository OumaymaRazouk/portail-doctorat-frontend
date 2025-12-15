import { Component } from '@angular/core';
import { LayoutComponent } from '../components/layout.component';
import { Router, RouterLink } from '@angular/router';
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
            <th>Motif rejet</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let i of inscriptions">
            <td>{{ i.type || 'INSCRIPTION' }}</td>
            <td>{{ i.anneeAcademique }}</td>
            <td><span class="badge" [class.ok]="i.status==='VALIDE'" [class.warn]="i.status==='EN_ATTENTE_ADMIN' || i.status==='EN_ATTENTE_DIRECTEUR'" [class.err]="i.status==='REJETE'">{{ i.status }}</span></td>
            <td>{{ i.status === 'REJETE' ? i.motifRejet : '' }}</td>
            <td>
              <button class="btn small" (click)="submit(i)" *ngIf="i.status==='BROUILLON'">Soumettre</button>
              <button class="btn small secondary" (click)="edit(i)" *ngIf="i.status==='BROUILLON'">Modifier</button>
              <button class="btn small danger" (click)="remove(i)" *ngIf="i.status==='BROUILLON'">Supprimer</button>
              <button class="btn small secondary" (click)="details(i)">Détails</button>
            </td>
          </tr>
        </tbody>
      </table>
    </app-layout>
  `,
  styles: [`
    .actions { display:flex; gap:10px; margin-bottom: 20px; }
    .btn {
      background: var(--primary);
      color: var(--primary-foreground);
      padding: 8px 14px;
      border-radius: 999px;
      text-decoration:none;
      border: none;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      transition: background-color 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease;
    }
    .btn.secondary { background: var(--info); }
    .btn.danger { background: var(--danger); }
    .btn.danger:hover { background:#b91c1c; }
    .btn.small { padding:6px 11px; font-size: 0.8rem; }
    .btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(15, 23, 42, 0.18);
    }
    .table {
      width:100%;
      border-collapse:collapse;
      background: var(--card-bg);
      border:1px solid var(--border-color);
      border-radius: 12px;
      overflow:hidden;
    }
    th, td { padding:10px 12px; border-bottom:1px solid var(--border-color); }
    th {
      background:#f9fafb;
      text-align:left;
      font-weight:600;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    .badge {
      padding:4px 9px;
      border-radius:999px;
      background:#e5e7eb;
      font-size:11px;
      font-weight:500;
    }
    .badge.ok { background:#dcfce7; color:#166534; }
    .badge.warn { background:#fef9c3; color:#854d0e; }
    .badge.err { background:#fee2e2; color:#991b1b; }
  `]
})
export class DoctorantDashboardComponent {
  inscriptions: (InscriptionDTO & { type?: 'INSCRIPTION'|'REINSCRIPTION' })[] = [];
  loading = false;

  constructor(private service: InscriptionService, private auth: AuthService, private router: Router) {
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

  edit(i: InscriptionDTO) {
    if (!i.id) return;
    this.router.navigate(['/inscriptions', i.id, 'edit']);
  }

  remove(i: InscriptionDTO) {
    if (!i.id) return;
    if (!confirm('Voulez-vous vraiment supprimer cette candidature ?')) return;
    this.service.delete(i.id).subscribe({
      next: () => this.load(),
      error: err => console.error(err)
    });
  }

  details(i: InscriptionDTO) {
    if (!i.id) return;
    this.router.navigate(['/inscriptions', i.id, 'consultation']);
  }
}
