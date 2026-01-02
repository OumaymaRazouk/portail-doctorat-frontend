import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../components/layout.component';
import { SoutenanceService, SoutenanceDTO, SoutenanceStatus, PlanificationInput, WeeklySoutenanceSummary, PrerequisDossier } from '../../core/services/soutenance.service';

@Component({
  selector: 'app-soutenance-admin',
  standalone: true,
  imports: [LayoutComponent, CommonModule, FormsModule],
  template: `
    <app-layout title="Soutenances - Espace Administratif">
      <div class="card">
        <h3>Dossiers de prérequis - Vérification administrative</h3>
        <div *ngIf="pendingPrereqLoading">Chargement...</div>
        <div *ngIf="!pendingPrereqLoading && pendingPrereqDossiers.length === 0" class="hint">Aucun dossier de prérequis en attente.</div>

        <table *ngIf="!pendingPrereqLoading && pendingPrereqDossiers.length > 0" class="table">
          <thead>
          <tr>
            <th>Doctorant</th>
            <th>Publications</th>
            <th>Communications</th>
            <th>Heures formation</th>
            <th>Durée (ans)</th>
            <th>Statut scientifique</th>
            <th>Actions</th>
          </tr>
          </thead>
          <tbody>
          <tr *ngFor="let d of pendingPrereqDossiers">
            <td>{{ d.doctorantId }}</td>
            <td>{{ d.publicationsCount }}</td>
            <td>{{ d.communicationsCount }}</td>
            <td>{{ d.heuresFormationCumulees }}</td>
            <td>{{ d.dureeDoctoratAnnees }}</td>
            <td>{{ d.etatScientifique }}</td>
            <td>
              <button type="button" class="btn small" (click)="validateAdministratifDossier(d, true)">Valider</button>
              <button type="button" class="btn small secondary" (click)="validateAdministratifDossier(d, false)">Refuser</button>
            </td>
          </tr>
          </tbody>
        </table>

        <div *ngIf="pendingPrereqMessage" class="msg">{{ pendingPrereqMessage }}</div>
        <div *ngIf="pendingPrereqError" class="err">{{ pendingPrereqError }}</div>
      </div>

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
          </div>
        </div>

        <div class="section">
          <h4>Dossier de prérequis</h4>
          <div *ngIf="prereqLoading">Chargement du dossier de prérequis...</div>
          <div *ngIf="!prereqLoading">
            <div *ngIf="prereqDossier; else noAdminPrereq">
              <div class="grid">
                <div><span class="label">Publications (Q1/Q2)</span><span class="value">{{ prereqDossier.publicationsCount }}</span></div>
                <div><span class="label">Communications</span><span class="value">{{ prereqDossier.communicationsCount }}</span></div>
                <div><span class="label">Heures de formation cumulées</span><span class="value">{{ prereqDossier.heuresFormationCumulees }}</span></div>
                <div><span class="label">Durée du doctorat (années)</span><span class="value">{{ prereqDossier.dureeDoctoratAnnees }}</span></div>
              </div>
              <div class="grid">
                <div>
                  <span class="label">Statut scientifique</span>
                  <span class="value">{{ prereqDossier.etatScientifique }}</span>
                </div>
                <div>
                  <span class="label">Commentaire scientifique</span>
                  <span class="value">{{ prereqDossier.commentaireScientifique || '-' }}</span>
                </div>
                <div>
                  <span class="label">Statut administratif</span>
                  <span class="value">{{ prereqDossier.etatAdministratif }}</span>
                </div>
                <div>
                  <span class="label">Commentaire administratif</span>
                  <span class="value">{{ prereqDossier.commentaireAdministratif || '-' }}</span>
                </div>
              </div>
              <div class="checklist">
                <div class="check-item" [ngClass]="prereqDossier.publicationsCount >= 2 ? 'ok' : 'nok'">
                  ✓ Publications: {{ prereqDossier.publicationsCount || 0 }}/2 min. requis
                </div>
                <div class="check-item" [ngClass]="prereqDossier.communicationsCount >= 2 ? 'ok' : 'nok'">
                  ✓ Communications: {{ prereqDossier.communicationsCount || 0 }}/2 min. requis
                </div>
                <div class="check-item" [ngClass]="prereqDossier.heuresFormationCumulees >= 200 ? 'ok' : 'nok'">
                  ✓ Formation: {{ prereqDossier.heuresFormationCumulees || 0 }}/200h min. requises
                </div>
                <div class="check-item" [ngClass]="(prereqDossier.dureeDoctoratAnnees || 0) <= 6 ? 'ok' : 'nok'">
                  ✓ Durée doctorat: {{ prereqDossier.dureeDoctoratAnnees || 0 }} ans / 6 max.
                </div>
              </div>
              <div class="actions">
                <button type="button" class="btn small" (click)="validateAdministratif(true)">Valider administrativement (heures de formation, pièces justificatives)</button>
                <button type="button" class="btn small secondary" (click)="validateAdministratif(false)">Refuser administrativement</button>
              </div>
              <div *ngIf="prereqMessage" class="msg">{{ prereqMessage }}</div>
              <div *ngIf="prereqError" class="err">{{ prereqError }}</div>
            </div>
            <ng-template #noAdminPrereq>
              <div class="hint">Aucun dossier de prérequis déclaré par le doctorant.</div>
            </ng-template>
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
    .card {
      background: var(--card-bg);
      border-radius: 16px;
      padding: 16px;
      box-shadow: var(--shadow-soft);
      margin-bottom: 16px;
      border: 1px solid var(--border-color);
      backdrop-filter: blur(14px);
    }
    .filters { display:flex; align-items:center; gap:8px; margin-bottom:8px; flex-wrap: wrap; }
    .filters label { color: rgba(229, 231, 235, 0.72); }

    .table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      background: rgba(2, 6, 23, 0.30);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      overflow: hidden;
    }
    th, td { padding: 10px 12px; border-bottom: 1px solid var(--border-color); text-align: left; }
    th { background: rgba(2, 6, 23, 0.55); color: rgba(229, 231, 235, 0.75); font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.03em; }
    td { color: rgba(229, 231, 235, 0.85); }
    tbody tr:hover { background: rgba(148, 163, 184, 0.06); }

    .badge { padding: 4px 10px; border-radius: 999px; background: rgba(148, 163, 184, 0.14); font-size: 12px; color: rgba(229, 231, 235, 0.78); }
    .badge.ok { background: rgba(34, 197, 94, 0.18); color: rgba(34, 197, 94, 0.95); }
    .badge.warn { background: rgba(245, 158, 11, 0.18); color: rgba(245, 158, 11, 0.95); }
    .badge.err { background: rgba(239, 68, 68, 0.18); color: rgba(239, 68, 68, 0.95); }

    .btn {
      background: var(--primary);
      color: var(--primary-foreground);
      padding: 6px 12px;
      border-radius: 999px;
      border: 0;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      transition: transform 0.12s ease, box-shadow 0.15s ease, filter 0.15s ease;
    }
    .btn:hover { transform: translateY(-1px); box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35); filter: brightness(1.02); }
    .btn.small { padding: 4px 10px; margin: 2px 0; font-size: 12px; }
    .btn.secondary { background: rgba(56, 189, 248, 0.20); color: rgba(229, 231, 235, 0.92); border: 1px solid rgba(56, 189, 248, 0.28); }
    .btn.danger { background: rgba(239, 68, 68, 0.20); color: rgba(229, 231, 235, 0.92); border: 1px solid rgba(239, 68, 68, 0.25); }

    .msg { margin-top: 8px; color: rgba(34, 197, 94, 0.95); }
    .err { margin-top: 8px; color: rgba(239, 68, 68, 0.95); }

    .form { display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap:14px 16px; margin-top:8px; align-items: start; }
    .row { min-width: 0; display:flex; flex-direction:column; gap:8px; }
    label { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; color: rgba(248, 250, 252, 0.82); font-weight: 600; }

    label::before {
      content: '';
      width: 18px;
      height: 18px;
      border-radius: 999px;
      background: rgba(148, 163, 184, 0.12);
      border: 1px solid rgba(148, 163, 184, 0.18);
      box-shadow: inset 0 1px 0 rgba(248, 250, 252, 0.06);
      flex-shrink: 0;
    }
    .input {
      padding: 10px 12px;
      border-radius: 12px;
      border: 1px solid var(--border-color);
      font-size: 13px;
      background: rgba(2, 6, 23, 0.45);
      color: rgba(229, 231, 235, 0.9);
      outline: none;
    }
    .input:focus { border-color: rgba(20, 184, 166, 0.65); box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.18); }

    .actions { grid-column: 1 / -1; display:flex; gap:10px; margin-top:8px; flex-wrap: wrap; justify-content: flex-end; }
    .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
    .section { margin-top:12px; }
    .section h4 { margin:0 0 8px; font-size:15px; color: var(--card-foreground); }
    .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:8px 16px; }
    .col-2 { grid-column:span 2; }
    .label { display:block; font-size:12px; color: rgba(229, 231, 235, 0.6); margin-bottom:2px; }
    .value { font-size:14px; color: rgba(229, 231, 235, 0.85); word-break:break-word; }
    .attachments { list-style:none; padding-left:0; margin:4px 0 0 0; display:flex; flex-direction:column; gap:4px; }
    .attachments .link { background:none; border:0; padding:0; color: rgba(56, 189, 248, 0.95); text-decoration:underline; font-size:14px; cursor:pointer; text-align:left; }
    .checklist { list-style:none; padding-left:0; margin:8px 0 8px 0; }
    .check-item { font-size:13px; color: rgba(229, 231, 235, 0.62); padding:4px 0; }
    .check-item.ok { color: rgba(34, 197, 94, 0.95); }
    .check-item.nok { color: rgba(239, 68, 68, 0.95); }

    .hint { color: rgba(229, 231, 235, 0.62); }
    .week-block { margin-top: 10px; padding-top: 10px; border-top: 1px dashed rgba(148, 163, 184, 0.25); }
    ul { color: rgba(229, 231, 235, 0.78); }

    @media (max-width: 980px) { .form { grid-template-columns: repeat(2, minmax(0, 1fr)); } .actions { justify-content: stretch; } }
    @media (max-width: 640px) { .form { grid-template-columns: 1fr; } }
  `]
})
export class SoutenanceAdminComponent {
  soutenances: SoutenanceDTO[] = [];
  loading = false;
  message = '';
  error = '';

  pendingPrereqDossiers: PrerequisDossier[] = [];
  pendingPrereqLoading = false;
  pendingPrereqError = '';
  pendingPrereqMessage = '';

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

  prereqDossier: PrerequisDossier | null = null;
  prereqLoading = false;
  prereqError = '';
  prereqMessage = '';

  constructor(private soutenanceService: SoutenanceService) {
    this.load();
    this.loadWeeklyStats();
    this.loadPendingPrereqs();
  }

  private loadPendingPrereqs() {
    this.pendingPrereqLoading = true;
    this.pendingPrereqError = '';
    this.pendingPrereqMessage = '';
    this.soutenanceService.listPrerequisDossiersPendingAdministratif().subscribe({
      next: res => {
        this.pendingPrereqLoading = false;
        if (res.errors && res.errors.length > 0) {
          this.pendingPrereqError = res.errors[0].message;
          this.pendingPrereqDossiers = [];
          return;
        }
        this.pendingPrereqDossiers = res.data?.prerequisDossiersPendingAdministratif || [];
      },
      error: e => {
        console.error(e);
        this.pendingPrereqLoading = false;
        this.pendingPrereqError = 'Erreur lors du chargement des dossiers de prérequis en attente';
        this.pendingPrereqDossiers = [];
      }
    });
  }

  validateAdministratifDossier(dossier: PrerequisDossier, valide: boolean) {
    if (!dossier) {
      return;
    }
    this.pendingPrereqError = '';
    this.pendingPrereqMessage = '';
    const commentaire = prompt('Commentaire administratif (optionnel) :') || undefined;
    this.soutenanceService.adminValidePrerequisDossier(dossier.doctorantId, valide, commentaire).subscribe({
      next: res => {
        if (res.errors && res.errors.length > 0) {
          this.pendingPrereqError = res.errors[0].message;
          return;
        }
        this.pendingPrereqMessage = valide ? 'Validation administrative enregistrée.' : 'Refus administratif enregistré.';
        this.pendingPrereqDossiers = this.pendingPrereqDossiers.filter(d => d.doctorantId !== dossier.doctorantId);
      },
      error: e => {
        console.error(e);
        this.pendingPrereqError = 'Erreur lors de la validation administrative du dossier de prérequis';
      }
    });
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
    this.prereqDossier = null;
    this.prereqError = '';
    this.prereqMessage = '';
    this.loadPrereqDossier(s.doctorantId);
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

  private loadPrereqDossier(doctorantId: string) {
    this.prereqLoading = true;
    this.prereqError = '';
    this.prereqMessage = '';
    this.soutenanceService.getPrerequisDossier(doctorantId).subscribe({
      next: res => {
        this.prereqLoading = false;
        this.prereqDossier = res.data?.prerequisDossierForDoctorant || null;
      },
      error: e => {
        console.error(e);
        this.prereqLoading = false;
        this.prereqError = 'Erreur lors du chargement du dossier de prérequis';
      }
    });
  }

  validateAdministratif(valide: boolean) {
    if (!this.detailSelected) {
      return;
    }
    this.prereqError = '';
    this.prereqMessage = '';
    const commentaire = prompt('Commentaire administratif (optionnel) :') || undefined;
    this.soutenanceService.adminValidePrerequisDossier(this.detailSelected.doctorantId, valide, commentaire).subscribe({
      next: res => {
        if (res.errors && res.errors.length > 0) {
          this.prereqError = res.errors[0].message;
          return;
        }
        const dossier = res.data?.adminValidePrerequisDossier;
        if (!dossier) {
          this.prereqError = "Réponse invalide du serveur lors de la validation administrative des prérequis";
          return;
        }
        const base: PrerequisDossier = this.prereqDossier || {
          doctorantId: dossier.doctorantId,
          publicationsCount: 0,
          communicationsCount: 0,
          heuresFormationCumulees: 0,
          dureeDoctoratAnnees: 0,
          etatScientifique: 'EN_ATTENTE',
          etatAdministratif: 'EN_ATTENTE'
        } as PrerequisDossier;
        this.prereqDossier = { ...base, ...dossier };
        this.prereqMessage = valide ? 'Pré-requis validés administrativement.' : 'Pré-requis refusés administrativement.';
      },
      error: e => {
        console.error(e);
        this.prereqError = 'Erreur lors de la validation administrative des prérequis';
      }
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
