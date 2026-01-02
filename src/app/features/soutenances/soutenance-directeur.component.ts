import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../components/layout.component';
import { AuthService } from '../../core/services/auth.service';
import { InscriptionDTO, InscriptionService } from '../../core/services/inscription.service';
import { SoutenanceService, SoutenanceDTO, JuryMemberInput, PlanificationInput, PrerequisDossier } from '../../core/services/soutenance.service';

@Component({
  selector: 'app-soutenance-directeur',
  standalone: true,
  imports: [LayoutComponent, CommonModule, FormsModule],
  template: `
    <app-layout title="Soutenances - Espace Directeur">
      <div class="card">
        <h3>Mes soutenances à suivre</h3>
        <div *ngIf="loading">Chargement...</div>
        <div *ngIf="!loading && soutenances.length === 0">Aucune soutenance.</div>

        <table *ngIf="!loading && soutenances.length > 0" class="table">
          <thead>
          <tr>
            <th>Doctorant</th>
            <th>Titre</th>
            <th>Statut</th>
            <th>Dates</th>
            <th>Actions</th>
          </tr>
          </thead>
          <tbody>
          <tr *ngFor="let s of soutenances">
            <td>{{ s.doctorantId }}</td>
            <td>{{ s.titreTheseDefinitif }}</td>
            <td><span class="badge" [ngClass]="statusClass(s.status)">{{ s.status }}</span></td>
            <td>
              <div *ngIf="s.dateSoumission">Soumise: {{ s.dateSoumission | date:'short' }}</div>
              <div *ngIf="s.datePlanifiee">Planifiée: {{ s.datePlanifiee | date:'short' }}</div>
            </td>
            <td>
              <button class="btn small" (click)="selectForJury(s)"
                      *ngIf="s.status === 'PREREQUIS_VALIDES' || s.status === 'JURY_PROPOSE' || s.status === 'JURY_VALIDE'">
                Gérer le jury
              </button>
              <button class="btn small secondary" (click)="selectForPlanification(s)"
                      *ngIf="s.status === 'SOUTENANCE_AUTORISEE' || s.status === 'PLANIFICATION_PROPOSEE' || s.status === 'SOUTENANCE_PLANIFIEE'">
                Proposer une date
              </button>
              <button class="btn small secondary" (click)="showDetails(s)">
                Détails
              </button>
            </td>
          </tr>
          </tbody>
        </table>

        <div *ngIf="message" class="msg">{{ message }}</div>
        <div *ngIf="error" class="err">{{ error }}</div>
      </div>

      <div class="card">
        <h3>Dossiers de prérequis - Avis scientifique</h3>
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
            <td>
              <button type="button" class="btn small" (click)="validateScientifiqueDossier(d, true)">Avis favorable</button>
              <button type="button" class="btn small secondary" (click)="validateScientifiqueDossier(d, false)">Avis défavorable</button>
            </td>
          </tr>
          </tbody>
        </table>

        <div *ngIf="pendingPrereqMessage" class="msg">{{ pendingPrereqMessage }}</div>
        <div *ngIf="pendingPrereqError" class="err">{{ pendingPrereqError }}</div>
      </div>

      <div class="card" *ngIf="selected">
        <h3>Composition du jury pour la soutenance du doctorant {{ selected.doctorantId }}</h3>
        <p class="hint">Le système requiert au moins <strong>2 rapporteurs</strong> et <strong>1 président</strong>.</p>

        <form (ngSubmit)="onSaveJury()" class="form">
          <div class="jury-grid">
            <div class="jury-row" *ngFor="let m of juryMembers; let i = index">
              <div class="row">
                <label>Nom</label>
                <input class="input" [(ngModel)]="m.nom" name="nom{{i}}" />
              </div>
              <div class="row">
                <label>Prénom</label>
                <input class="input" [(ngModel)]="m.prenom" name="prenom{{i}}" />
              </div>
              <div class="row">
                <label>Affiliation</label>
                <input class="input" [(ngModel)]="m.affiliation" name="affiliation{{i}}" />
              </div>
              <div class="row">
                <label>Email</label>
                <input class="input" [(ngModel)]="m.email" name="email{{i}}" />
              </div>
              <div class="row">
                <label>Téléphone</label>
                <input class="input" [(ngModel)]="m.telephone" name="telephone{{i}}" />
              </div>
              <div class="row">
                <label>Rôle</label>
                <select class="input" [(ngModel)]="m.role" name="role{{i}}">
                  <option value="RAPPORTEUR">Rapporteur</option>
                  <option value="EXAMINATEUR">Examinateur</option>
                  <option value="PRESIDENT">Président</option>
                  <option value="INVITE">Invité</option>
                </select>
              </div>
            </div>
          </div>

          <div class="actions">
            <button type="submit" class="btn" [disabled]="savingJury">Enregistrer le jury</button>
            <button type="button" class="btn secondary" (click)="cancelJury()">Annuler</button>
          </div>

          <div *ngIf="juryError" class="err">{{ juryError }}</div>
          <div *ngIf="juryMessage" class="msg">{{ juryMessage }}</div>
        </form>
      </div>

      <div class="card" *ngIf="planifSelected">
        <h3>Proposition de planification pour la soutenance du doctorant {{ planifSelected.doctorantId }}</h3>
        <form (ngSubmit)="onSavePlanification()" class="form">
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
            <input class="input" [(ngModel)]="planifForm.lienVisioconference" name="lienVisioconference" />
          </div>
          <div class="actions">
            <button type="submit" class="btn" [disabled]="savingPlanif">Enregistrer la proposition</button>
            <button type="button" class="btn secondary" (click)="cancelPlanification()">Annuler</button>
          </div>
          <div *ngIf="planifError" class="err">{{ planifError }}</div>
          <div *ngIf="planifMessage" class="msg">{{ planifMessage }}</div>
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
            <div *ngIf="prereqDossier; else noDirectorPrereq">
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
              </div>
              <div class="grid">
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
                <button type="button" class="btn small" (click)="validateScientifique(true)">Valider scientifiquement (publications, communications)</button>
                <button type="button" class="btn small secondary" (click)="validateScientifique(false)">Refuser scientifiquement</button>
              </div>
              <div *ngIf="prereqMessage" class="msg">{{ prereqMessage }}</div>
              <div *ngIf="prereqError" class="err">{{ prereqError }}</div>
            </div>
            <ng-template #noDirectorPrereq>
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
    .btn.small { padding: 4px 10px; font-size: 12px; }
    .btn.secondary { background: rgba(56, 189, 248, 0.20); color: rgba(229, 231, 235, 0.92); border: 1px solid rgba(56, 189, 248, 0.28); }

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

    .jury-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:12px; }
    .jury-row { border: 1px solid var(--border-color); border-radius: 14px; padding: 12px; background: rgba(2, 6, 23, 0.30); }

    .actions { grid-column: 1 / -1; display:flex; gap:10px; flex-wrap: wrap; justify-content: flex-end; }
    .hint { font-size:13px; color: rgba(229, 231, 235, 0.62); }
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

    @media (max-width: 980px) { .form { grid-template-columns: repeat(2, minmax(0, 1fr)); } .actions { justify-content: stretch; } }
    @media (max-width: 640px) { .form { grid-template-columns: 1fr; } }
  `]
})
export class SoutenanceDirecteurComponent {
  soutenances: SoutenanceDTO[] = [];
  loading = false;
  message = '';
  error = '';

  directeurId: string | null = null;
  supervisedDoctorantIds: string[] = [];

  pendingPrereqDossiers: PrerequisDossier[] = [];
  pendingPrereqLoading = false;
  pendingPrereqError = '';
  pendingPrereqMessage = '';

  selected: SoutenanceDTO | null = null;
  detailSelected: SoutenanceDTO | null = null;
  juryMembers: JuryMemberInput[] = [
    { nom: '', prenom: '', affiliation: '', email: '', role: 'RAPPORTEUR' },
    { nom: '', prenom: '', affiliation: '', email: '', role: 'RAPPORTEUR' },
    { nom: '', prenom: '', affiliation: '', email: '', role: 'PRESIDENT' }
  ];
  savingJury = false;
  juryError = '';
  juryMessage = '';

  planifSelected: SoutenanceDTO | null = null;
  planifForm: PlanificationInput = { dateHeure: '', salle: '', lieu: '', lienVisioconference: '' };
  savingPlanif = false;
  planifError = '';
  planifMessage = '';

  prereqDossier: PrerequisDossier | null = null;
  prereqLoading = false;
  prereqError = '';
  prereqMessage = '';

  constructor(private auth: AuthService, private soutenanceService: SoutenanceService, private inscriptions: InscriptionService) {
    this.load();
  }

  private load() {
    this.loading = true; this.message = ''; this.error = '';
    this.auth.me().subscribe({
      next: me => {
        this.directeurId = me.id;
        this.soutenanceService.listForDirecteur(me.id).subscribe({
          next: res => {
            this.soutenances = res.data?.soutenancesForDirecteur || [];
            this.loading = false;
            this.loadSupervisedDoctorantsAndPendingPrereqs(me.id);
          },
          error: e => {
            console.error(e);
            this.error = 'Erreur lors du chargement des soutenances';
            this.loading = false;
            this.loadSupervisedDoctorantsAndPendingPrereqs(me.id);
          }
        });
      },
      error: () => {
        this.error = 'Impossible de charger le profil directeur';
        this.loading = false;
      }
    });
  }

  private loadSupervisedDoctorantsAndPendingPrereqs(directeurId: string) {
    this.supervisedDoctorantIds = [];
    this.inscriptions.listByDirecteur(directeurId).subscribe({
      next: (list: InscriptionDTO[]) => {
        const ids = (list || []).map(i => i.doctorantId).filter(Boolean);
        this.supervisedDoctorantIds = Array.from(new Set(ids));
        this.loadPendingPrereqs();
      },
      error: () => {
        this.supervisedDoctorantIds = [];
        this.loadPendingPrereqs();
      }
    });
  }

  private loadPendingPrereqs() {
    this.pendingPrereqLoading = true;
    this.pendingPrereqError = '';
    this.pendingPrereqMessage = '';
    this.soutenanceService.listPrerequisDossiersPendingScientifique().subscribe({
      next: res => {
        this.pendingPrereqLoading = false;
        if (res.errors && res.errors.length > 0) {
          this.pendingPrereqError = res.errors[0].message;
          this.pendingPrereqDossiers = [];
          return;
        }
        const all = res.data?.prerequisDossiersPendingScientifique || [];
        const ids = this.supervisedDoctorantIds || [];
        this.pendingPrereqDossiers = ids.length > 0 ? all.filter(d => ids.includes(d.doctorantId)) : all;
      },
      error: e => {
        console.error(e);
        this.pendingPrereqLoading = false;
        this.pendingPrereqError = 'Erreur lors du chargement des dossiers de prérequis en attente';
        this.pendingPrereqDossiers = [];
      }
    });
  }

  validateScientifiqueDossier(dossier: PrerequisDossier, valide: boolean) {
    if (!dossier) {
      return;
    }
    this.pendingPrereqError = '';
    this.pendingPrereqMessage = '';
    const commentaire = prompt('Commentaire scientifique (optionnel) :') || undefined;
    this.soutenanceService.directeurValidePrerequisDossier(dossier.doctorantId, valide, commentaire).subscribe({
      next: res => {
        if (res.errors && res.errors.length > 0) {
          this.pendingPrereqError = res.errors[0].message;
          return;
        }
        this.pendingPrereqMessage = valide ? 'Avis scientifique favorable enregistré.' : 'Avis scientifique défavorable enregistré.';
        this.pendingPrereqDossiers = this.pendingPrereqDossiers.filter(d => d.doctorantId !== dossier.doctorantId);
      },
      error: e => {
        console.error(e);
        this.pendingPrereqError = 'Erreur lors de la validation scientifique du dossier de prérequis';
      }
    });
  }
  selectForPlanification(s: SoutenanceDTO) {
    this.planifSelected = s;
    this.planifError = '';
    this.planifMessage = '';
    this.planifForm = {
      dateHeure: s.datePlanifiee || '',
      salle: s.salle || '',
      lieu: s.lieu || '',
      lienVisioconference: ''
    };
  }

  cancelPlanification() {
    this.planifSelected = null;
  }

  onSavePlanification() {
    if (!this.planifSelected) return;
    this.savingPlanif = true;
    this.planifError = '';
    this.planifMessage = '';
    this.soutenanceService.directeurPlanifySoutenance(this.planifSelected.id, this.planifForm).subscribe({
      next: res => {
        this.savingPlanif = false;
        if (res.errors && res.errors.length > 0) {
          this.planifError = res.errors[0].message;
          return;
        }
        this.planifMessage = 'Proposition de date enregistrée';
        this.planifSelected = null;
        this.load();
      },
      error: e => {
        console.error(e);
        this.savingPlanif = false;
        this.planifError = 'Erreur lors de la proposition de planification';
      }
    });
  }

  selectForJury(s: SoutenanceDTO) {
    this.selected = s;
    this.juryError = '';
    this.juryMessage = '';
    this.soutenanceService.loadJury(s.id).subscribe({
      next: res => {
        const list = res.data?.juryForSoutenance || [];
        if (list && list.length > 0) {
          this.juryMembers = list.map(m => ({ ...m }));
        } else {
          this.juryMembers = [
            { nom: '', prenom: '', affiliation: '', email: '', role: 'RAPPORTEUR' },
            { nom: '', prenom: '', affiliation: '', email: '', role: 'RAPPORTEUR' },
            { nom: '', prenom: '', affiliation: '', email: '', role: 'PRESIDENT' }
          ];
        }
      },
      error: () => {
        this.juryMembers = [
          { nom: '', prenom: '', affiliation: '', email: '', role: 'RAPPORTEUR' },
          { nom: '', prenom: '', affiliation: '', email: '', role: 'RAPPORTEUR' },
          { nom: '', prenom: '', affiliation: '', email: '', role: 'PRESIDENT' }
        ];
      }
    });
  }

  cancelJury() {
    this.selected = null;
  }

  onSaveJury() {
    if (!this.selected) return;
    this.savingJury = true;
    this.juryError = '';
    this.juryMessage = '';

    const membres: JuryMemberInput[] = this.juryMembers
      .filter(m => m.nom && m.prenom && m.affiliation && m.email && m.role)
      .map(m => ({ ...m }));

    if (membres.length === 0) {
      this.juryError = 'Veuillez saisir au moins un membre du jury.';
      this.savingJury = false;
      return;
    }

    this.soutenanceService.directeurProposeJury(this.selected.id, membres).subscribe({
      next: res => {
        this.savingJury = false;
        if (res.errors && res.errors.length > 0) {
          this.juryError = res.errors[0].message;
          return;
        }
        this.juryMessage = 'Jury enregistré avec succès';
        this.load();
      },
      error: e => {
        console.error(e);
        this.savingJury = false;
        this.juryError = 'Erreur lors de lenregistrement du jury';
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
      error: () => {
        this.error = 'Erreur lors du téléchargement du fichier';
      }
    });
  }

  detailHasAnyAttachment(): boolean {
    const s = this.detailSelected;
    if (!s) return false;
    return !!(s.manuscritPath || s.rapportAntiPlagiatPath || s.attestationsFormationsPath || s.demandeManuscritePath);
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

  validateScientifique(valide: boolean) {
    if (!this.detailSelected) {
      return;
    }
    this.prereqError = '';
    this.prereqMessage = '';
    const commentaire = prompt('Commentaire scientifique (optionnel) :') || undefined;
    this.soutenanceService.directeurValidePrerequisDossier(this.detailSelected.doctorantId, valide, commentaire).subscribe({
      next: res => {
        if (res.errors && res.errors.length > 0) {
          this.prereqError = res.errors[0].message;
          return;
        }
        const dossier = res.data?.directeurValidePrerequisDossier;
        if (!dossier) {
          this.prereqError = "Réponse invalide du serveur lors de la validation scientifique des prérequis";
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
        this.prereqMessage = valide ? 'Pré-requis validés scientifiquement.' : 'Pré-requis refusés scientifiquement.';
      },
      error: e => {
        console.error(e);
        this.prereqError = 'Erreur lors de la validation scientifique des prérequis';
      }
    });
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

  statusClass(status: string) {
    if (status === 'SOUTENANCE_EFFECTUEE' || status === 'SOUTENANCE_PLANIFIEE' || status === 'PLANIFICATION_PROPOSEE' || status === 'JURY_VALIDE' || status === 'SOUTENANCE_AUTORISEE') {
      return 'ok';
    }
    if (status === 'REJETE') return 'err';
    if (status === 'SOUMIS' || status === 'PREREQUIS_EN_VERIFICATION' || status === 'PREREQUIS_VALIDES' || status === 'JURY_PROPOSE') return 'warn';
    return '';
  }
}
