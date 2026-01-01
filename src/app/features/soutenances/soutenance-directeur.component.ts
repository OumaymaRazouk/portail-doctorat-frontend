import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../components/layout.component';
import { AuthService } from '../../core/services/auth.service';
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
              <div class="actions">
                <button type="button" class="btn small" (click)="validateScientifique(true)">Valider scientifiquement</button>
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
    .card { background:#fff; border-radius:12px; padding:16px; box-shadow:0 4px 12px rgba(0,0,0,0.06); margin-bottom:16px; }
    .table { width:100%; border-collapse:collapse; margin-top:8px; }
    th, td { padding:8px 10px; border-bottom:1px solid #e5e7eb; text-align:left; }
    .badge { padding:4px 8px; border-radius:6px; background:#e5e7eb; font-size:12px; }
    .badge.ok { background:#dcfce7; color:#166534; }
    .badge.warn { background:#fef9c3; color:#854d0e; }
    .badge.err { background:#fee2e2; color:#991b1b; }
    .btn { background:#4f46e5; color:#fff; padding:6px 10px; border-radius:8px; border:0; cursor:pointer; font-size:13px; }
    .btn.small { padding:4px 8px; }
    .btn.secondary { background:#0ea5e9; }
    .msg { margin-top:8px; color:#166534; }
    .err { margin-top:8px; color:#b91c1c; }
    .form { display:flex; flex-direction:column; gap:12px; margin-top:8px; }
    .row { display:flex; flex-direction:column; gap:4px; }
    .input { padding:6px 8px; border-radius:8px; border:1px solid #e2e8f0; font-size:13px; }
    .jury-grid { display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:12px; }
    .jury-row { border:1px solid #e5e7eb; border-radius:8px; padding:8px; background:#f9fafb; }
    .actions { display:flex; gap:8px; }
    .hint { font-size:13px; color:#4b5563; }
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
export class SoutenanceDirecteurComponent {
  soutenances: SoutenanceDTO[] = [];
  loading = false;
  message = '';
  error = '';

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

  constructor(private auth: AuthService, private soutenanceService: SoutenanceService) {
    this.load();
  }

  private load() {
    this.loading = true; this.message = ''; this.error = '';
    this.auth.me().subscribe({
      next: me => {
        this.soutenanceService.listForDirecteur(me.id).subscribe({
          next: res => {
            this.soutenances = res.data?.soutenancesForDirecteur || [];
            this.loading = false;
          },
          error: e => {
            console.error(e);
            this.error = 'Erreur lors du chargement des soutenances';
            this.loading = false;
          }
        });
      },
      error: () => {
        this.error = 'Impossible de charger le profil directeur';
        this.loading = false;
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
