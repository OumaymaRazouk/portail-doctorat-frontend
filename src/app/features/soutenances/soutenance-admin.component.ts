import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../components/layout.component';
import { SoutenanceService, SoutenanceDTO, SoutenanceStatus, PlanificationInput } from '../../core/services/soutenance.service';

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
              <button class="btn small secondary" *ngIf="s.status==='SOUTENANCE_AUTORISEE' || s.status==='SOUTENANCE_PLANIFIEE'" (click)="openPlanification(s)">Planifier</button>
              <button class="btn small" *ngIf="s.status==='SOUTENANCE_PLANIFIEE'" (click)="markDone(s)">Marquer effectuée</button>
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
    'SOUTENANCE_PLANIFIEE',
    'SOUTENANCE_EFFECTUEE',
    'REJETE'
  ];
  statusFilter: '' | SoutenanceStatus = '';

  planifTarget: SoutenanceDTO | null = null;
  planifForm: PlanificationInput = { dateHeure: '', salle: '', lieu: '', lienVisioconference: '' };
  savingPlanif = false;

  constructor(private soutenanceService: SoutenanceService) {
    this.load();
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

  markPrerequisUnderReview(s: SoutenanceDTO) {
    this.soutenanceService.adminMarkPrerequisUnderReview(s.id).subscribe({
      next: res => this.afterMutation(res.errors),
      error: e => this.handleError(e)
    });
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
    if (status === 'SOUTENANCE_EFFECTUEE' || status === 'SOUTENANCE_PLANIFIEE' || status === 'JURY_VALIDE' || status === 'SOUTENANCE_AUTORISEE') {
      return 'ok';
    }
    if (status === 'REJETE') return 'err';
    if (status === 'SOUMIS' || status === 'PREREQUIS_EN_VERIFICATION' || status === 'PREREQUIS_VALIDES' || status === 'JURY_PROPOSE') return 'warn';
    return '';
  }
}
