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
    .checklist { list-style:none; padding-left:0; margin:8px 0 8px 0; }
    .check-item { font-size:13px; color:#4b5563; padding:4px 0; }
    .check-item.ok { color:#16a34a; }
    .check-item.nok { color:#b91c1c; }
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
