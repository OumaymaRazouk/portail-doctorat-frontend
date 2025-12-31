import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../components/layout.component';
import { SoutenanceService, SoutenanceDTO, SoutenanceStatus, PlanificationInput, WeeklySoutenanceSummary } from '../../core/services/soutenance.service';

@Component({
  selector: 'app-soutenance-admin',
  standalone: true,
  imports: [LayoutComponent, CommonModule, FormsModule],
  template: `
    <app-layout title="Soutenances - Espace Administratif">
      <div class="card">
        <div class="filters">
          <label>Filtrer par statut :</label>
          <select class="input" [(ngModel)]="statusFilter" (change)="load()">
            <option value="">Tous</option>
            <option *ngFor="let s of allStatuses" [value]="s">{{ s }}</option>
          </select>
        </div>

        <div *ngIf="loading">Chargement...</div>
        <div *ngIf="!loading && soutenances.length === 0">Aucune soutenance.</div>

        <table *ngIf="!loading && soutenances.length > 0" class="table">
          <thead>
          <tr>
            <th>Doctorant</th>
            <th>Directeur</th>
            <th>Titre</th>
            <th>Statut</th>
            <th>Dates</th>
            <th>Actions</th>
          </tr>
          </thead>
          <tbody>
          <tr *ngFor="let s of soutenances">
            <td>{{ s.doctorantId }}</td>
            <td>{{ s.directeurId }}</td>
            <td>{{ s.titreTheseDefinitif }}</td>
            <td><span class="badge" [ngClass]="statusClass(s.status)">{{ s.status }}</span></td>
            <td>
              <div *ngIf="s.dateSoumission">Soumise: {{ s.dateSoumission | date:'short' }}</div>
              <div *ngIf="s.dateAutorisation">Autorisée: {{ s.dateAutorisation | date:'short' }}</div>
              <div *ngIf="s.datePlanifiee">Planifiée: {{ s.datePlanifiee | date:'short' }}</div>
            </td>
            <td>
              <button class="btn small" *ngIf="s.status==='SOUMIS'" (click)="markPrerequisUnderReview(s)">Préreq. en vérification</button>
              <button class="btn small" *ngIf="s.status==='SOUMIS' || s.status==='PREREQUIS_EN_VERIFICATION'" (click)="validatePrerequis(s)">Valider préreq.</button>
              <button class="btn small danger" *ngIf="s.status==='SOUMIS' || s.status==='PREREQUIS_EN_VERIFICATION'" (click)="reject(s)">Rejeter</button>
              <button class="btn small" *ngIf="s.status==='JURY_PROPOSE'" (click)="validateJury(s)">Valider jury</button>
              <button class="btn small" *ngIf="s.status==='JURY_VALIDE'" (click)="authorizeSoutenance(s)">Autoriser soutenance</button>
              <button class="btn small secondary" *ngIf="s.status==='SOUTENANCE_AUTORISEE' || s.status==='PLANIFICATION_PROPOSEE' || s.status==='SOUTENANCE_PLANIFIEE'" (click)="openPlanification(s)">Planifier</button>
              <button class="btn small" *ngIf="s.status==='SOUTENANCE_PLANIFIEE'" (click)="markDone(s)">Marquer effectuée</button>
              <button class="btn small secondary" *ngIf="s.status==='SOUTENANCE_AUTORISEE' || s.status==='PLANIFICATION_PROPOSEE' || s.status==='SOUTENANCE_PLANIFIEE' || s.status==='SOUTENANCE_EFFECTUEE'" (click)="downloadAutorisation(s)">Télécharger autorisation</button>
              <button class="btn small secondary" *ngIf="s.status==='SOUTENANCE_PLANIFIEE' || s.status==='SOUTENANCE_EFFECTUEE'" (click)="downloadProcesVerbal(s)">Procès-verbal</button>
              <button class="btn small secondary" *ngIf="s.manuscritPath" (click)="downloadPiece(s, 'manuscrit')">Manuscrit</button>
              <button class="btn small secondary" *ngIf="s.rapportAntiPlagiatPath" (click)="downloadPiece(s, 'rapport')">Anti-plagiat</button>
              <button class="btn small secondary" *ngIf="s.attestationsFormationsPath" (click)="downloadPiece(s, 'attestations')">Attestations</button>
              <button class="btn small secondary" *ngIf="s.demandeManuscritePath" (click)="downloadPiece(s, 'demande')">Demande</button>
              <button class="btn small secondary" (click)="showDetails(s)">Détails</button>
            </td>
          </tr>
          </tbody>
        </table>

        <div *ngIf="message" class="msg">{{ message }}</div>
        <div *ngIf="error" class="err">{{ error }}</div>
      </div>

      <div class="card" *ngIf="planifTarget">
        <h3>Planification de la soutenance du doctorant {{ planifTarget.doctorantId }}</h3>
        <form (ngSubmit)="savePlanification()" class="form">
          <div class="row">
            <label>Date et heure (ISO, ex: 2025-12-20T10:00:00)</label>
            <input class="input" [(ngModel)]="planifForm.dateHeure" name="dateHeure" />
          </div>
          <div class="row">
            <label>Salle</label>
            <input class="input" [(ngModel)]="planifForm.salle" name="salle" />
          </div>
          <div class="row">
            <label>Lieu</label>
            <input class="input" [(ngModel)]="planifForm.lieu" name="lieu" />
          </div>
          <div class="row">
            <label>Lien visioconférence (optionnel)</label>
            <input class="input" [(ngModel)]="planifForm.lienVisioconference" name="lien" />
          </div>
          <div class="actions">
            <button type="submit" class="btn" [disabled]="savingPlanif">Enregistrer la planification</button>
            <button type="button" class="btn secondary" (click)="cancelPlanification()">Annuler</button>
          </div>
        </form>
      </div>

      <div class="card" *ngIf="detailSelected">
        <div class="header">
          <h3>Détail de la soutenance sélectionnée</h3>
        </div>

        <div class="section">
          <h4>Informations générales</h4>
          <div class="grid">
            <div><span class="label">Identifiant</span><span class="value">{{ detailSelected.id }}</span></div>
            <div><span class="label">Doctorant (ID)</span><span class="value">{{ detailSelected.doctorantId }}</span></div>
            <div><span class="label">Directeur (ID)</span><span class="value">{{ detailSelected.directeurId }}</span></div>
            <div><span class="label">Statut</span><span class="value">{{ detailSelected.status }}</span></div>
          </div>
        </div>

        <div class="section">
          <h4>Informations scientifiques</h4>
          <div class="grid">
            <div class="col-2"><span class="label">Titre définitif de la thèse</span><span class="value">{{ detailSelected.titreTheseDefinitif }}</span></div>
            <div class="col-2"><span class="label">Résumé final</span><span class="value">{{ detailSelected.resumeFinal }}</span></div>
            <div><span class="label">Mots-clés</span><span class="value">{{ detailSelected.motsCles?.join(', ') }}</span></div>
            <div><span class="label">Publications (Q1/Q2)</span><span class="value">{{ detailSelected.publicationsCount }}</span></div>
            <div><span class="label">Communications</span><span class="value">{{ detailSelected.communicationsCount }}</span></div>
            <div><span class="label">Heures de formation cumulées</span><span class="value">{{ detailSelected.heuresFormationCumulees }}</span></div>
            <div><span class="label">Durée du doctorat (années)</span><span class="value">{{ detailSelected.dureeDoctoratAnnees }}</span></div>
          </div>
        </div>

        <div class="section">
          <h4>Pièces jointes</h4>
          <div *ngIf="!detailHasAnyAttachment()">Aucune pièce jointe.</div>
          <ul *ngIf="detailHasAnyAttachment()" class="attachments">
            <li *ngIf="detailSelected.manuscritPath"><a href="#" class="link" (click)="openAttachment(detailSelected, detailSelected.manuscritPath, $event)">{{ detailSelected.manuscritPath }}</a></li>
            <li *ngIf="detailSelected.rapportAntiPlagiatPath"><a href="#" class="link" (click)="openAttachment(detailSelected, detailSelected.rapportAntiPlagiatPath, $event)">{{ detailSelected.rapportAntiPlagiatPath }}</a></li>
            <li *ngIf="detailSelected.attestationsFormationsPath"><a href="#" class="link" (click)="openAttachment(detailSelected, detailSelected.attestationsFormationsPath, $event)">{{ detailSelected.attestationsFormationsPath }}</a></li>
            <li *ngIf="detailSelected.demandeManuscritePath"><a href="#" class="link" (click)="openAttachment(detailSelected, detailSelected.demandeManuscritePath, $event)">{{ detailSelected.demandeManuscritePath }}</a></li>
          </ul>
        </div>
      </div>

      <div class="card">
        <h3>Statistiques hebdomadaires des soutenances (gRPC)</h3>
        <div *ngIf="statsLoading">Chargement...</div>
        <div *ngIf="!statsLoading && statsError" class="err">{{ statsError }}</div>
        <div *ngIf="!statsLoading && !statsError && weeklyStats.length === 0">Aucune soutenance planifiée sur la période.</div>

        <ng-container *ngIf="!statsLoading && !statsError && weeklyStats.length > 0">
          <div *ngFor="let w of weeklyStats" class="week-block">
            <h4>Semaine {{ w.weekStart }} → {{ w.weekEnd }} ({{ w.total }} soutenance(s))</h4>
            <table *ngIf="w.soutenances?.length" class="table">
              <thead>
                <tr>
                  <th>Doctorant</th>
                  <th>Directeur</th>
                  <th>Titre</th>
                  <th>Date / Lieu</th>
                  <th>Jury</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let s of w.soutenances">
                  <td>{{ s.doctorantId }}</td>
                  <td>{{ s.directeurId }}</td>
                  <td>{{ s.titreTheseDefinitif }}</td>
                  <td>
                    <div *ngIf="s.datePlanifiee">{{ s.datePlanifiee | date:'short' }}</div>
                    <div *ngIf="s.salle || s.lieu">{{ s.salle }} {{ s.lieu }}</div>
                  </td>
                  <td>
                    <div *ngIf="!s.jury || s.jury.length === 0">Aucun jury défini.</div>
                    <ul *ngIf="s.jury && s.jury.length > 0">
                      <li *ngFor="let j of s.jury">
                        <strong>{{ j.role }}</strong> - {{ j.nom }} {{ j.prenom }} ({{ j.affiliation }})
                      </li>
                    </ul>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </ng-container>
      </div>
    </app-layout>
  `,
  styles: [`
    .card { background:#fff; border-radius:12px; padding:16px; box-shadow:0 4px 12px rgba(0,0,0,0.06); margin-bottom:16px; }
    .filters { display:flex; align-items:center; gap:8px; margin-bottom:8px; }
    .table { width:100%; border-collapse:collapse; margin-top:8px; }
    th, td { padding:8px 10px; border-bottom:1px solid #e5e7eb; text-align:left; }
    .badge { padding:4px 8px; border-radius:6px; background:#e5e7eb; font-size:12px; }
    .badge.ok { background:#dcfce7; color:#166534; }
    .badge.warn { background:#fef9c3; color:#854d0e; }
    .badge.err { background:#fee2e2; color:#991b1b; }
    .btn { background:#4f46e5; color:#fff; padding:6px 10px; border-radius:8px; border:0; cursor:pointer; font-size:13px; }
    .btn.small { padding:4px 8px; margin:2px 0; }
    .btn.secondary { background:#0ea5e9; }
    .msg { margin-top:8px; color:#166534; }
    .err { margin-top:8px; color:#b91c1c; }
    .form { display:flex; flex-direction:column; gap:12px; margin-top:8px; }
    .row { display:flex; flex-direction:column; gap:4px; }
    .input { padding:6px 8px; border-radius:8px; border:1px solid #e2e8f0; font-size:13px; }
    .actions { display:flex; gap:8px; margin-top:8px; }
    .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
    .section { margin-top:12px; }
    .section h4 { margin:0 0 8px; font-size:15px; }
    .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:8px 16px; }
    .col-2 { grid-column:span 2; }
    .label { display:block; font-size:12px; color:#6b7280; margin-bottom:2px; }
    .value { font-size:14px; color:#111827; word-break:break-word; }
    .attachments { list-style:none; padding-left:0; margin:4px 0 0 0; display:flex; flex-direction:column; gap:4px; }
    .attachments .link { background:none; border:0; padding:0; color:#2563eb; text-decoration:underline; font-size:14px; cursor:pointer; text-align:left; }
    .checklist { list-style:none; padding-left:0; margin:4px 0 0 0; }
    .check-item { font-size:13px; color:#4b5563; }
    .check-item.ok { color:#16a34a; }
    .check-item.nok { color:#b91c1c; }
  `]
})
export class SoutenanceAdminComponent {
  soutenances: SoutenanceDTO[] = [];
  loading = false;
  message = '';
  error = '';

  allStatuses: SoutenanceStatus[] = [
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
  statusFilter: '' | SoutenanceStatus = '';

  planifTarget: SoutenanceDTO | null = null;
  planifForm: PlanificationInput = { dateHeure: '', salle: '', lieu: '', lienVisioconference: '' };
  savingPlanif = false;

  weeklyStats: WeeklySoutenanceSummary[] = [];
  statsLoading = false;
  statsError = '';

  detailSelected: SoutenanceDTO | null = null;

  constructor(private soutenanceService: SoutenanceService) {
    this.load();
    this.loadWeeklyStats();
  }

  load() {
    this.loading = true; this.message = ''; this.error = '';
    const status = this.statusFilter || undefined;
    this.soutenanceService.listForAdmin(status).subscribe({
      next: res => {
        this.soutenances = res.data?.soutenancesForAdmin || [];
        this.loading = false;
      },
      error: e => {
        console.error(e);
        this.error = 'Erreur lors du chargement des soutenances';
        this.loading = false;
      }
    });
  }

  showDetails(s: SoutenanceDTO) {
    this.detailSelected = s;
  }

  private loadWeeklyStats() {
    this.statsLoading = true; this.statsError = '';
    this.soutenanceService.getWeeklyStats(undefined, undefined, true).subscribe({
      next: res => {
        this.weeklyStats = res;
        this.statsLoading = false;
      },
      error: () => {
        this.statsError = 'Erreur lors du chargement des statistiques de soutenance.';
        this.statsLoading = false;
      }
    });
  }

  markPrerequisUnderReview(s: SoutenanceDTO) {
    this.soutenanceService.adminMarkPrerequisUnderReview(s.id).subscribe({
      next: res => this.afterMutation(res.errors),
      error: e => this.handleError(e)
    });
  }

  detailHasAnyAttachment(): boolean {
    const s = this.detailSelected;
    if (!s) return false;
    return !!(s.manuscritPath || s.rapportAntiPlagiatPath || s.attestationsFormationsPath || s.demandeManuscritePath);
  }

  hasMinPublications(s: SoutenanceDTO): boolean {
    return (s.publicationsCount || 0) >= 2;
  }

  hasMinCommunications(s: SoutenanceDTO): boolean {
    return (s.communicationsCount || 0) >= 2;
  }

  hasMinHeuresFormation(s: SoutenanceDTO): boolean {
    return (s.heuresFormationCumulees || 0) >= 200;
  }

  hasValidDuree(s: SoutenanceDTO): boolean {
    const d = s.dureeDoctoratAnnees || 0;
    return d > 0 && d <= 6;
  }

  hasManuscrit(s: SoutenanceDTO): boolean {
    return !!s.manuscritPath;
  }

  hasAntiPlagiat(s: SoutenanceDTO): boolean {
    return !!s.rapportAntiPlagiatPath;
  }

  hasAttestations(s: SoutenanceDTO): boolean {
    return !!s.attestationsFormationsPath;
  }

  hasDemande(s: SoutenanceDTO): boolean {
    return !!s.demandeManuscritePath;
  }

  openAttachment(s: SoutenanceDTO, fileName: string, event: MouseEvent) {
    event.preventDefault();
    if (!s.id || !fileName) {
      return;
    }
    const payload = encodeURIComponent(JSON.stringify({ id: s.id, fileName, type: 'soutenance' }));
    const url = `${window.location.origin}/?viewer=${payload}`;
    window.open(url, '_blank', 'noopener');
  }

  validatePrerequis(s: SoutenanceDTO) {
    const commentaire = prompt('Commentaire sur les prérequis (optionnel) :') || undefined;
    this.soutenanceService.adminValidatePrerequis(s.id, commentaire).subscribe({
      next: res => this.afterMutation(res.errors),
      error: e => this.handleError(e)
    });
  }

  reject(s: SoutenanceDTO) {
    const motif = prompt('Motif du rejet :');
    if (motif === null) return;
    this.soutenanceService.adminRejectSoutenance(s.id, motif).subscribe({
      next: res => this.afterMutation(res.errors),
      error: e => this.handleError(e)
    });
  }

  validateJury(s: SoutenanceDTO) {
    const commentaire = prompt('Commentaire sur le jury (optionnel) :') || undefined;
    this.soutenanceService.adminValidateJury(s.id, commentaire).subscribe({
      next: res => this.afterMutation(res.errors),
      error: e => this.handleError(e)
    });
  }

  authorizeSoutenance(s: SoutenanceDTO) {
    this.soutenanceService.adminAuthorizeSoutenance(s.id).subscribe({
      next: res => this.afterMutation(res.errors),
      error: e => this.handleError(e)
    });
  }

  openPlanification(s: SoutenanceDTO) {
    this.planifTarget = s;
    this.planifForm = {
      dateHeure: s.datePlanifiee || '',
      salle: s.salle || '',
      lieu: s.lieu || '',
      lienVisioconference: ''
    };
  }

  cancelPlanification() {
    this.planifTarget = null;
  }

  savePlanification() {
    if (!this.planifTarget) return;
    this.savingPlanif = true;
    this.soutenanceService.adminPlanifySoutenance(this.planifTarget.id, this.planifForm).subscribe({
      next: res => {
        this.savingPlanif = false;
        this.afterMutation(res.errors);
        this.planifTarget = null;
      },
      error: e => {
        this.savingPlanif = false;
        this.handleError(e);
      }
    });
  }

  markDone(s: SoutenanceDTO) {
    const date = prompt('Date effective (ISO, ex: 2025-12-20T12:30:00). Laisser vide pour utiliser la date planifiée :') || undefined;
    this.soutenanceService.adminMarkSoutenanceDone(s.id, date).subscribe({
      next: res => this.afterMutation(res.errors),
      error: e => this.handleError(e)
    });
  }

  downloadAutorisation(s: SoutenanceDTO) {
    this.soutenanceService.downloadAutorisation(s.id).subscribe({
      next: (blob: any) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `autorisation-${s.id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: e => this.handleError(e)
    });
  }

  downloadProcesVerbal(s: SoutenanceDTO) {
    this.soutenanceService.downloadProcesVerbal(s.id).subscribe({
      next: (blob: any) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `proces-verbal-${s.id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: e => this.handleError(e)
    });
  }

  downloadPiece(s: SoutenanceDTO, type: 'manuscrit' | 'rapport' | 'attestations' | 'demande') {
    let fileName: string | undefined;
    if (type === 'manuscrit') {
      fileName = s.manuscritPath;
    } else if (type === 'rapport') {
      fileName = s.rapportAntiPlagiatPath;
    } else if (type === 'attestations') {
      fileName = s.attestationsFormationsPath;
    } else if (type === 'demande') {
      fileName = s.demandeManuscritePath;
    }
    if (!fileName) {
      return;
    }
    this.soutenanceService.downloadAttachment(s.id, fileName).subscribe({
      next: (blob: any) => {
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
      },
      error: e => this.handleError(e)
    });
  }

  private afterMutation(errors?: { message: string }[]) {
    if (errors && errors.length > 0) {
      this.error = errors[0].message;
      this.message = '';
    } else {
      this.error = '';
      this.message = 'Action effectuée avec succès';
      this.load();
    }
  }

  private handleError(e: any) {
    console.error(e);
    this.error = e?.error?.message || 'Erreur lors de l\'action';
  }

  statusClass(status: string) {
    if (status === 'SOUTENANCE_EFFECTUEE' || status === 'SOUTENANCE_PLANIFIEE' || status === 'PLANIFICATION_PROPOSEE' || status === 'JURY_VALIDE' || status === 'SOUTENANCE_AUTORISEE') {
      return 'ok';
    }
    if (status === 'REJETE') return 'err';
    if (status === 'SOUMIS' || status === 'PREREQUIS_EN_VERIFICATION' || status === 'PREREQUIS_VALIDES' || status === 'JURY_PROPOSE') return 'warn';
    return '';
  }
}
