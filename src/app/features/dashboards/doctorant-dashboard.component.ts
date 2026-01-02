import { Component } from '@angular/core';
import { LayoutComponent } from '../components/layout.component';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InscriptionService, InscriptionDTO, InscriptionStatus } from '../../core/services/inscription.service';
import { AuthService } from '../../core/services/auth.service';
import { SoutenanceService, SoutenanceStatus } from '../../core/services/soutenance.service';

@Component({
  selector: 'app-doctorant-dashboard',
  standalone: true,
  imports: [LayoutComponent, RouterLink, CommonModule],
  template: `
    <app-layout [title]="isDoctorant ? 'Espace Doctorant' : 'Espace Candidat'">
      <div class="actions">
        <!-- Seuls les candidats peuvent créer une nouvelle inscription/candidature -->
        <a *ngIf="!isDoctorant" routerLink="/inscriptions/nouvelle" class="btn">Nouvelle candidature</a>
        <!-- Les doctorants ne voient que la réinscription -->
        <a *ngIf="isDoctorant" routerLink="/reinscriptions/nouvelle" class="btn secondary">Nouvelle réinscription</a>
      </div>

      <div class="timeline-card">
        <h3 class="section-title">Suivi de mon parcours</h3>
        <div class="steps">
          <div class="step" [ngClass]="{ done: hasInitialInscriptionValide, current: hasInitialInscription && !hasInitialInscriptionValide }">
            <div class="step-index">1</div>
            <div class="step-body">
              <div class="step-title">Candidature / Inscription initiale</div>
              <div class="step-status">
                <ng-container *ngIf="!hasInitialInscription">Aucune candidature déposée</ng-container>
                <ng-container *ngIf="hasInitialInscription && !hasInitialInscriptionValide">En cours de validation</ng-container>
                <ng-container *ngIf="hasInitialInscriptionValide">Inscription validée</ng-container>
              </div>
            </div>
          </div>

          <div class="step" [ngClass]="{ disabled: !hasInitialInscriptionValide, done: hasReinscriptions, current: hasInitialInscriptionValide && !hasReinscriptions && !hasSoutenance }">
            <div class="step-index">2</div>
            <div class="step-body">
              <div class="step-title">Réinscriptions annuelles</div>
              <div class="step-status">
                <ng-container *ngIf="!hasInitialInscriptionValide">Disponible après validation de l'inscription</ng-container>
                <ng-container *ngIf="hasInitialInscriptionValide && !hasReinscriptions">Aucune réinscription encore</ng-container>
                <ng-container *ngIf="hasReinscriptions">{{ reinscriptionsCount }} réinscription(s)</ng-container>
              </div>
            </div>
          </div>

          <div class="step" [ngClass]="{ disabled: !hasInitialInscriptionValide, done: hasSoutenance, current: hasSoutenance }">
            <div class="step-index">3</div>
            <div class="step-body">
              <div class="step-title">Soutenance</div>
              <div class="step-status">
                <ng-container *ngIf="!hasInitialInscriptionValide">Disponible en fin de parcours</ng-container>
                <ng-container *ngIf="hasInitialInscriptionValide && !hasSoutenance">Aucune demande de soutenance</ng-container>
                <ng-container *ngIf="hasSoutenance">Statut : {{ soutenanceStatus }}</ng-container>
              </div>
              <a *ngIf="isDoctorant" routerLink="/soutenances/mine" class="step-link">Voir le détail de ma soutenance</a>
            </div>
          </div>
        </div>
        <div class="status-lines">
          <div class="status-row">
            <div class="status-label">Inscription initiale</div>
            <div class="status-track">
              <div *ngFor="let s of inscriptionFlow"
                   class="status-step"
                   [ngClass]="[getInitialStatusClass(s), s === 'VALIDE' ? 'final-ok' : '', s === 'REJETE' ? 'final-ko' : '']">
                <div class="status-step-circle">{{ getStepIndex(inscriptionFlow, s) }}</div>
                <div class="status-step-label">{{ s }}</div>
              </div>
            </div>
          </div>
          <div class="status-row">
            <div class="status-label">Réinscriptions</div>
            <div class="status-track">
              <div *ngFor="let s of inscriptionFlow"
                   class="status-step"
                   [ngClass]="[getReinsStatusClass(s), s === 'VALIDE' ? 'final-ok' : '', s === 'REJETE' ? 'final-ko' : '']">
                <div class="status-step-circle">{{ getStepIndex(inscriptionFlow, s) }}</div>
                <div class="status-step-label">{{ s }}</div>
              </div>
            </div>
          </div>
          <div class="status-row">
            <div class="status-label">Soutenance</div>
            <div class="status-track">
              <div *ngFor="let s of soutenanceFlow"
                   class="status-step"
                   [ngClass]="getSoutenanceStatusClass(s)">
                <div class="status-step-circle">{{ getStepIndex(soutenanceFlow, s) }}</div>
                <div class="status-step-label">{{ s }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h3>Mes demandes</h3>
      <div class="actions" *ngIf="isDoctorant">
        <button class="btn secondary" type="button" (click)="downloadRapportParcours()">
          Télécharger le rapport de parcours
        </button>
      </div>
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
    .btn.secondary {
      background: rgba(56, 189, 248, 0.20);
      color: rgba(229, 231, 235, 0.92);
      border: 1px solid rgba(56, 189, 248, 0.28);
    }
    .btn.danger { background: rgba(239, 68, 68, 0.20); color: rgba(229, 231, 235, 0.92); border: 1px solid rgba(239, 68, 68, 0.25); }
    .btn.danger:hover { filter: brightness(1.05); }
    .btn.small { padding:6px 11px; font-size: 0.8rem; }
    .btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(15, 23, 42, 0.18);
    }
    .timeline-card {
      margin-bottom: 20px;
      padding: 16px 18px;
      border-radius: 18px;
      background: rgba(2, 6, 23, 0.35);
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-soft);
      backdrop-filter: blur(14px);
    }
    .section-title {
      margin: 0 0 12px 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: var(--card-foreground);
    }
    .steps {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .step {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px 0;
      border-top: 1px dashed var(--border-color);
    }
    .step:first-child {
      border-top: 0;
    }
    .step-index {
      width: 26px;
      height: 26px;
      border-radius: 999px;
      background: rgba(148, 163, 184, 0.12);
      color: rgba(248, 250, 252, 0.78);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.9rem;
      flex-shrink: 0;
      box-shadow: 0 0 0 1px rgba(148, 163, 184, 0.25);
    }
    .step-body {
      flex: 1;
    }
    .step-title {
      position: relative;
      font-weight: 600;
      font-size: 0.95rem;
      margin-bottom: 2px;
      padding-left: 20px;
    }
    .step-title::before {
      content: '';
      position: absolute;
      left: 0;
      top: 4px;
      width: 12px;
      height: 12px;
      border-radius: 999px;
      background: rgba(148, 163, 184, 0.35);
    }
    .steps .step:nth-child(1) .step-title::before { background: rgba(56, 189, 248, 0.65); }
    .steps .step:nth-child(2) .step-title::before { background: rgba(20, 184, 166, 0.65); }
    .steps .step:nth-child(3) .step-title::before { background: rgba(245, 158, 11, 0.75); }
    .step-status {
      font-size: 0.85rem;
      color: rgba(229, 231, 235, 0.72);
    }
    .step.done .step-index {
      background: rgba(34, 197, 94, 0.18);
      color: rgba(34, 197, 94, 0.95);
      box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.35);
    }
    .step.current .step-index {
      background: rgba(20, 184, 166, 0.22);
      color: rgba(20, 184, 166, 0.95);
      box-shadow: 0 0 0 1px rgba(20, 184, 166, 0.45);
    }
    .step.disabled .step-index {
      background: rgba(148, 163, 184, 0.10);
      color: rgba(229, 231, 235, 0.45);
      box-shadow: none;
    }
    .step.disabled .step-status {
      color: rgba(229, 231, 235, 0.4);
    }
    .step-link {
      display: inline-block;
      margin-top: 4px;
      font-size: 0.8rem;
      color: rgba(56, 189, 248, 0.95);
      text-decoration: underline;
      cursor: pointer;
    }
    .status-lines {
      margin-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .status-row {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .status-label {
      width: 150px;
      font-size: 0.8rem;
      font-weight: 500;
      color: rgba(229, 231, 235, 0.7);
    }
    .status-track {
      position: relative;
      display: flex;
      align-items: flex-start;
      gap: 28px;
      padding: 10px 4px 4px 4px;
      overflow-x: auto;
    }
    .status-track::before {
      content: '';
      position: absolute;
      left: 12px;
      right: 12px;
      top: 22px;
      height: 2px;
      background: rgba(148, 163, 184, 0.22);
      z-index: 0;
    }
    .status-step {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      z-index: 1;
      min-width: 48px;
    }
    .status-step-circle {
      width: 26px;
      height: 26px;
      border-radius: 999px;
      border: 2px solid rgba(148, 163, 184, 0.25);
      background: rgba(2, 6, 23, 0.55);
      color: rgba(229, 231, 235, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .status-step-label {
      font-size: 0.7rem;
      color: rgba(229, 231, 235, 0.6);
      text-align: center;
      max-width: 80px;
      word-break: break-word;
    }
    .status-step.past .status-step-circle {
      background: rgba(34, 197, 94, 0.95);
      border-color: rgba(34, 197, 94, 0.75);
      color: rgba(2, 6, 23, 0.92);
    }
    .status-step.current .status-step-circle {
      background: var(--primary);
      border-color: rgba(20, 184, 166, 0.85);
      color: var(--primary-foreground);
      box-shadow: 0 0 0 2px rgba(20, 184, 166, 0.25);
    }
    .status-step.current.final-ok .status-step-circle {
      background: rgba(34, 197, 94, 0.95);
      border-color: rgba(34, 197, 94, 0.75);
      color: rgba(2, 6, 23, 0.92);
      box-shadow: 0 0 0 2px rgba(34, 197, 94, 0.35);
    }
    .status-step.current.final-ko .status-step-circle {
      background: rgba(239, 68, 68, 0.95);
      border-color: rgba(239, 68, 68, 0.70);
      color: rgba(2, 6, 23, 0.92);
      box-shadow: 0 0 0 2px rgba(239, 68, 68, 0.35);
    }
    .status-step.future .status-step-circle {
      background: rgba(148, 163, 184, 0.14);
      border-color: rgba(148, 163, 184, 0.18);
      color: rgba(229, 231, 235, 0.5);
    }
    .status-step.none .status-step-circle {
      background: rgba(148, 163, 184, 0.08);
      border-color: rgba(148, 163, 184, 0.12);
      color: rgba(229, 231, 235, 0.35);
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
      background: rgba(2, 6, 23, 0.55);
      text-align:left;
      font-weight:600;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.03em;
      color: rgba(229, 231, 235, 0.75);
    }
    td { color: rgba(229, 231, 235, 0.82); }
    tbody tr:hover { background: rgba(148, 163, 184, 0.06); }
    .badge {
      padding:4px 9px;
      border-radius:999px;
      background: rgba(148, 163, 184, 0.14);
      font-size:11px;
      font-weight:500;
      color: rgba(229, 231, 235, 0.75);
    }
    .badge.ok { background: rgba(34, 197, 94, 0.18); color: rgba(34, 197, 94, 0.95); }
    .badge.warn { background: rgba(245, 158, 11, 0.18); color: rgba(245, 158, 11, 0.95); }
    .badge.err { background: rgba(239, 68, 68, 0.18); color: rgba(239, 68, 68, 0.95); }
  `]
})
export class DoctorantDashboardComponent {
  inscriptions: (InscriptionDTO & { type?: 'INSCRIPTION'|'REINSCRIPTION' })[] = [];
  loading = false;
  isDoctorant = false;
  hasInitialInscription = false;
  hasInitialInscriptionValide = false;
  hasReinscriptions = false;
  reinscriptionsCount = 0;
  hasSoutenance = false;
  soutenanceStatus: string | null = null;
  private doctorantId: string | null = null;

  // Flux d'inscription: brouillon -> directeur -> admin -> valide ou rejet
  inscriptionFlow: InscriptionStatus[] = ['BROUILLON', 'EN_ATTENTE_DIRECTEUR', 'EN_ATTENTE_ADMIN', 'VALIDE', 'REJETE'];
  soutenanceFlow: SoutenanceStatus[] = [
    'BROUILLON',
    'SOUMIS',
    'PREREQUIS_EN_VERIFICATION',
    'PREREQUIS_VALIDES',
    'JURY_PROPOSE',
    'JURY_VALIDE',
    'SOUTENANCE_AUTORISEE',
    'PLANIFICATION_PROPOSEE',
    'SOUTENANCE_PLANIFIEE',
    'SOUTENANCE_EFFECTUEE',
    'REJETE'
  ];
  currentInitialStatus: InscriptionStatus | null = null;
  currentReinscriptionStatus: InscriptionStatus | null = null;
  currentSoutenanceStatus: SoutenanceStatus | null = null;

  constructor(private service: InscriptionService, private auth: AuthService, private router: Router, private soutenance: SoutenanceService) {
    // Détermine si l'utilisateur connecté est déjà doctorant
    this.isDoctorant = this.auth.hasRole('DOCTORANT');
    this.load();
  }

  private load() {
    this.loading = true;
    this.auth.me().subscribe({
      next: me => {
        this.doctorantId = me.id;
        this.service.listByDoctorant(me.id).subscribe({
          next: list => {
            this.inscriptions = list;

            const initial = list.find(i => !i.type || i.type === 'INSCRIPTION');
            this.hasInitialInscription = !!initial;
            this.hasInitialInscriptionValide = !!initial && initial.status === 'VALIDE';
            this.currentInitialStatus = (initial?.status as InscriptionStatus) || null;

            const reins = list.filter(i => i.type === 'REINSCRIPTION');
            this.reinscriptionsCount = reins.length;
            this.hasReinscriptions = this.reinscriptionsCount > 0;

            if (reins.length > 0) {
              const last = reins[reins.length - 1];
              this.currentReinscriptionStatus = (last.status as InscriptionStatus) || null;
            } else {
              this.currentReinscriptionStatus = null;
            }

            this.loading = false;
          },
          error: () => { this.loading = false; }
        })

        // Récupération d'un résumé de la soutenance pour le suivi global
        if (this.isDoctorant) {
          this.soutenance.listForDoctorant(me.id).subscribe({
            next: res => {
              const list = res.data?.soutenancesForDoctorant || [];
              if (list.length > 0) {
                const current = list.find(s => s.status === 'BROUILLON') || list[0];
                this.soutenanceStatus = current.status;
                this.hasSoutenance = true;
                this.currentSoutenanceStatus = current.status as SoutenanceStatus;
              } else {
                this.soutenanceStatus = null;
                this.hasSoutenance = false;
                this.currentSoutenanceStatus = null;
              }
            },
            error: () => {
              this.soutenanceStatus = null;
              this.hasSoutenance = false;
              this.currentSoutenanceStatus = null;
            }
          });
        } else {
          this.soutenanceStatus = null;
          this.hasSoutenance = false;
        }
      },
      error: () => { this.loading = false; }
    })
  }

  private getStatusPosition(flow: string[], current: string | null, value: string): 'past' | 'current' | 'future' | 'none' {
    if (!current) return 'none';
    const currentIndex = flow.indexOf(current);
    const index = flow.indexOf(value);
    if (currentIndex === -1 || index === -1) return 'none';
    if (index < currentIndex) return 'past';
    if (index === currentIndex) return 'current';
    return 'future';
  }

  getStepIndex(flow: string[], value: string): number {
    const idx = flow.indexOf(value);
    return idx === -1 ? 0 : idx + 1;
  }

  getInitialStatusClass(s: InscriptionStatus) {
    return this.getStatusPosition(this.inscriptionFlow, this.currentInitialStatus, s);
  }

  getReinsStatusClass(s: InscriptionStatus) {
    return this.getStatusPosition(this.inscriptionFlow, this.currentReinscriptionStatus, s);
  }

  getSoutenanceStatusClass(s: SoutenanceStatus) {
    return this.getStatusPosition(this.soutenanceFlow, this.currentSoutenanceStatus, s);
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

  downloadRapportParcours() {
    if (!this.doctorantId) return;
    this.service.downloadRapportParcours(this.doctorantId).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rapport-parcours-${this.doctorantId}.pdf`;
      a.target = '_blank';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
