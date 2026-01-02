import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../components/layout.component';
import { AuthService } from '../../core/services/auth.service';
import { UsersService, SimpleUser } from '../../core/services/users.service';
import { SoutenanceService, SoutenanceDTO, SoutenanceDraftInput, PrerequisDossier, PrerequisDossierInput } from '../../core/services/soutenance.service';

@Component({
  selector: 'app-soutenance-doctorant',
  standalone: true,
  imports: [LayoutComponent, CommonModule, FormsModule],
  template: `
    <app-layout title="Ma soutenance">
      <div *ngIf="loading" class="info">Chargement...</div>

      <div *ngIf="!loading" class="content-wrapper">
        <div class="card status-card">
          <h4>Dossier de prérequis</h4>
          <div *ngIf="prereqLoading" class="info">Chargement du dossier de prérequis...</div>
          <div *ngIf="!prereqLoading">
            <div class="section">
              <div class="grid">
                <div>
                  <span class="label">Statut scientifique</span>
                  <span class="badge" [ngClass]="badgeClassForEtat(prereqDossier?.etatScientifique)">
                    {{ prereqDossier?.etatScientifique || 'EN_ATTENTE' }}
                  </span>
                </div>
                <div>
                  <span class="label">Statut administratif</span>
                  <span class="badge" [ngClass]="badgeClassForEtat(prereqDossier?.etatAdministratif)">
                    {{ prereqDossier?.etatAdministratif || 'EN_ATTENTE' }}
                  </span>
                </div>
              </div>
            </div>

            <form (ngSubmit)="onSavePrereqDossier()" class="form" *ngIf="!prereqLocked()">
              <div class="grid">
                <div class="row">
                  <label for="prereqPublicationsCount">Nombre de publications Q1/Q2</label>
                  <input
                    id="prereqPublicationsCount"
                    name="prereqPublicationsCount"
                    type="number"
                    min="0"
                    class="input"
                    [(ngModel)]="prereqForm.publicationsCount"
                  />
                </div>
                <div class="row">
                  <label for="prereqCommunicationsCount">Nombre de communications / conférences</label>
                  <input
                    id="prereqCommunicationsCount"
                    name="prereqCommunicationsCount"
                    type="number"
                    min="0"
                    class="input"
                    [(ngModel)]="prereqForm.communicationsCount"
                  />
                </div>
              </div>

              <div class="grid">
                <div class="row">
                  <label for="prereqHeuresFormationCumulees">Heures de formation doctorale cumulées</label>
                  <input
                    id="prereqHeuresFormationCumulees"
                    name="prereqHeuresFormationCumulees"
                    type="number"
                    min="0"
                    class="input"
                    [(ngModel)]="prereqForm.heuresFormationCumulees"
                  />
                </div>
                <div class="row">
                  <label for="prereqDureeDoctoratAnnees">Durée du doctorat (années)</label>
                  <input
                    id="prereqDureeDoctoratAnnees"
                    name="prereqDureeDoctoratAnnees"
                    type="number"
                    min="0"
                    class="input"
                    [(ngModel)]="prereqForm.dureeDoctoratAnnees"
                  />
                </div>
              </div>

              <div class="actions">
                <button type="submit" class="btn" [disabled]="prereqSaving">
                  {{ prereqDossier ? 'Mettre à jour le dossier' : 'Enregistrer le dossier' }}
                </button>
              </div>

              <div *ngIf="prereqError" class="error">{{ prereqError }}</div>
              <div *ngIf="prereqSuccess" class="success">{{ prereqSuccess }}</div>
            </form>

            <div *ngIf="prereqLocked()" class="info">
              Votre dossier de prérequis est entièrement validé : vérification scientifique par votre directeur (publications, communications), vérification administrative (heures de formation, pièces justificatives) et seuils exigés atteints. Vous pouvez maintenant déposer une demande de soutenance.
            </div>
          </div>
        </div>

        <div class="card" *ngIf="soutenances.length > 0">
          <h4>Mes soutenances</h4>
          <table class="table">
            <thead>
              <tr>
                <th>Doctorant</th>
                <th>Statut</th>
                <th>Date soumission</th>
                <th>Date planifiée</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of soutenances">
                <td>{{ s.doctorantId }}</td>
                <td><span class="badge" [ngClass]="statusClass(s.status)">{{ s.status }}</span></td>
                <td>{{ s.dateSoumission ? (s.dateSoumission | date:'short') : '-' }}</td>
                <td>{{ s.datePlanifiee ? (s.datePlanifiee | date:'short') : '-' }}</td>
                <td>
                  <button type="button" class="btn secondary" *ngIf="s.status === 'BROUILLON'" (click)="editDraft(s)">Modifier</button>
                  <button type="button" class="btn secondary" *ngIf="s.status === 'BROUILLON'" (click)="deleteDraft(s)">Supprimer</button>
                  <button
                    type="button"
                    class="btn"
                    *ngIf="s.status === 'BROUILLON'"
                    [disabled]="!canSubmitSoutenance() || submitting"
                    (click)="onSubmit(s)">
                    Soumettre
                  </button>
                  <button type="button" class="btn secondary" (click)="selectSoutenance(s)">Détail</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card" *ngIf="selected">
          <div class="header">
            <h4>Dossier SOUTENANCE</h4>
          </div>

          <div class="section">
            <h5>Informations générales</h5>
            <div class="grid">
              <div><span class="label">Identifiant</span><span class="value">{{ selected.id }}</span></div>
              <div><span class="label">Statut</span><span class="value">{{ selected.status }}</span></div>
              <div><span class="label">Date soumission</span><span class="value">{{ selected.dateSoumission || '-' }}</span></div>
              <div><span class="label">Date planifiée</span><span class="value">{{ selected.datePlanifiee || '-' }}</span></div>
            </div>
          </div>

          <div class="section">
            <h5>Informations scientifiques</h5>
            <div class="grid">
              <div class="col-2"><span class="label">Titre définitif</span><span class="value">{{ selected.titreTheseDefinitif }}</span></div>
              <div class="col-2"><span class="label">Résumé final</span><span class="value">{{ selected.resumeFinal }}</span></div>
              <div><span class="label">Mots-clés</span><span class="value">{{ selected.motsCles?.join(', ') }}</span></div>
            </div>
          </div>

          <div class="section">
            <h5>Pièces jointes</h5>
            <div *ngIf="!selectedHasAnyAttachment()">Aucune pièce jointe.</div>
            <ul *ngIf="selectedHasAnyAttachment()" class="attachments">
              <li *ngIf="selected.manuscritPath"><a href="#" class="link" (click)="openAttachment(selected, selected.manuscritPath, $event)">{{ selected.manuscritPath }}</a></li>
              <li *ngIf="selected.rapportAntiPlagiatPath"><a href="#" class="link" (click)="openAttachment(selected, selected.rapportAntiPlagiatPath, $event)">{{ selected.rapportAntiPlagiatPath }}</a></li>
              <li *ngIf="selected.attestationsFormationsPath"><a href="#" class="link" (click)="openAttachment(selected, selected.attestationsFormationsPath, $event)">{{ selected.attestationsFormationsPath }}</a></li>
              <li *ngIf="selected.demandeManuscritePath"><a href="#" class="link" (click)="openAttachment(selected, selected.demandeManuscritePath, $event)">{{ selected.demandeManuscritePath }}</a></li>
            </ul>
          </div>

          <div class="section" *ngIf="selected.status === 'SOUTENANCE_AUTORISEE'
              || selected.status === 'PLANIFICATION_PROPOSEE'
              || selected.status === 'SOUTENANCE_PLANIFIEE'
              || selected.status === 'SOUTENANCE_EFFECTUEE'">
            <h5>Documents PDF</h5>
            <button type="button" class="btn secondary" (click)="downloadAutorisation(selected)">
              Autorisation officielle de soutenance
            </button>
          </div>
        </div>

        <div class="card">
          <h4>Formulaires de demande de soutenance</h4>

          <!-- Formulaire accessible uniquement après validation complète des prérequis -->
          <div *ngIf="!prereqLocked()" class="info">
            Vous ne pouvez pas encore créer une demande de soutenance. Votre dossier de prérequis doit d'abord être validé scientifiquement par votre directeur (publications, communications) et validé administrativement par le service (heures de formation, pièces justificatives). Le système vérifie automatiquement que les seuils exigés (publications, formations, etc.) sont atteints avant d'autoriser la demande.
          </div>

          <!-- Formulaire visible seulement si aucune soutenance n'existe encore ou si la soutenance courante est un brouillon -->
          <form (ngSubmit)="onSaveDraft()" class="form" *ngIf="prereqLocked() && doctorantId && (soutenances.length === 0 || editingDraft)">
            <div class="row">
              <label for="directeurId">Directeur de thèse</label>
              <select id="directeurId" name="directeurId" [(ngModel)]="form.directeurId" required class="input">
                <option value="" disabled>-- Sélectionner un encadrant --</option>
                <option *ngFor="let e of encadrants" [value]="e.id">
                  {{ e.firstName }} {{ e.lastName }} ({{ e.email }})
                </option>
              </select>
            </div>

            <div class="row">
              <label for="titre">Titre définitif de la thèse</label>
              <input id="titre" name="titre" [(ngModel)]="form.titreTheseDefinitif" required class="input" />
            </div>

            <div class="row">
              <label for="resume">Résumé final</label>
              <textarea id="resume" name="resume" [(ngModel)]="form.resumeFinal" rows="4" class="input" required></textarea>
            </div>

            <div class="row">
              <label for="motsCles">Mots-clés (séparés par des virgules)</label>
              <input id="motsCles" name="motsCles" [(ngModel)]="motsClesText" class="input" />
            </div>

            <!-- Déclaration des prérequis quantitatifs par le doctorant -->

            <div class="grid">
              <div class="row">
                <label for="manuscrit">Manuscrit final (fichier PDF)</label>
                <input id="manuscrit" name="manuscrit" type="file" accept="application/pdf" (change)="onFileSelected($event, 'manuscrit')" class="input" />
              </div>
              <div class="row">
                <label for="antiPlagiat">Rapport anti-plagiat (fichier PDF)</label>
                <input id="antiPlagiat" name="antiPlagiat" type="file" accept="application/pdf" (change)="onFileSelected($event, 'antiPlagiat')" class="input" />
              </div>
            </div>

            <div class="grid">
              <div class="row">
                <label for="attestations">Attestations de formations (fichier PDF)</label>
                <input id="attestations" name="attestations" type="file" accept="application/pdf" (change)="onFileSelected($event, 'attestations')" class="input" />
              </div>
              <div class="row">
                <label for="demande">Demande manuscrite (fichier PDF)</label>
                <input id="demande" name="demande" type="file" accept="application/pdf" (change)="onFileSelected($event, 'demande')" class="input" />
              </div>
            </div>

            <div class="actions">
              <button type="submit" class="btn" [disabled]="saving">
                {{ current ? 'Mettre à jour le brouillon' : 'Enregistrer le brouillon' }}
              </button>
            </div>

            <div *ngIf="errorMessage" class="error">{{ errorMessage }}</div>
            <div *ngIf="successMessage" class="success">{{ successMessage }}</div>
          </form>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .content-wrapper {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .card, .status-card {
      background: var(--card-bg);
      border-radius: 16px;
      padding: 16px;
      box-shadow: var(--shadow-soft);
      border: 1px solid var(--border-color);
      backdrop-filter: blur(14px);
    }
    .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
    .section { margin-top:12px; }
    .section h5 { margin:0 0 8px; font-size:15px; }
    .status-card h4 { margin-top: 0; }
    .form { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px 16px; align-items: start; }
    .row { min-width: 0; display: flex; flex-direction: column; gap: 8px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
    .col-2 { grid-column: span 2; }
    h4, h5 { color: var(--card-foreground); }
    .label { display:block; font-size:12px; color: rgba(229, 231, 235, 0.6); margin-bottom:2px; }
    .value { font-size:14px; color: rgba(229, 231, 235, 0.85); word-break:break-word; }
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
      font-size: 14px;
      background: rgba(2, 6, 23, 0.45);
      color: rgba(229, 231, 235, 0.9);
      outline: none;
    }
    .input:focus {
      border-color: rgba(20, 184, 166, 0.65);
      box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.18);
    }
    .btn {
      background: var(--primary);
      color: var(--primary-foreground);
      padding: 8px 14px;
      border-radius: 999px;
      border: 0;
      cursor: pointer;
      font-weight: 600;
      transition: transform 0.12s ease, box-shadow 0.15s ease, filter 0.15s ease;
    }
    .btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);
      filter: brightness(1.02);
    }
    .btn.secondary { background: rgba(56, 189, 248, 0.20); color: rgba(229, 231, 235, 0.92); border: 1px solid rgba(56, 189, 248, 0.28); }
    .actions { grid-column: 1 / -1; display:flex; gap:10px; margin-top:8px; justify-content: flex-end; flex-wrap: wrap; }
    .badge { padding:4px 10px; border-radius:999px; background: rgba(148, 163, 184, 0.14); font-size:12px; color: rgba(229, 231, 235, 0.78); }
    .badge.ok { background: rgba(34, 197, 94, 0.18); color: rgba(34, 197, 94, 0.95); }
    .badge.warn { background: rgba(245, 158, 11, 0.18); color: rgba(245, 158, 11, 0.95); }
    .badge.err { background: rgba(239, 68, 68, 0.18); color: rgba(239, 68, 68, 0.95); }
    .table { width:100%; border-collapse:collapse; margin-top:8px; background: rgba(2, 6, 23, 0.30); border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; }
    th, td { padding:10px 12px; border-bottom:1px solid var(--border-color); text-align:left; }
    th { background: rgba(2, 6, 23, 0.55); color: rgba(229, 231, 235, 0.75); font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.03em; }
    td { color: rgba(229, 231, 235, 0.85); }
    .row-clickable { cursor:pointer; }
    .row-clickable:hover { background: rgba(148, 163, 184, 0.08); }
    .error { margin-top:8px; color: rgba(239, 68, 68, 0.95); font-size:13px; }
    .success { margin-top:8px; color: rgba(34, 197, 94, 0.95); font-size:13px; }
    .info { font-size: 14px; color: rgba(229, 231, 235, 0.72); }
    .timeline { list-style:none; padding:0; margin:8px 0 0 0; }
    .timeline-step { padding:4px 0; font-size:13px; color: rgba(229, 231, 235, 0.62); }
    .timeline-step.done { color: rgba(34, 197, 94, 0.95); }
    .timeline-step.current { font-weight:600; color: rgba(56, 189, 248, 0.95); }
    .attachments { list-style:none; padding-left:0; margin:0; display:flex; flex-direction:column; gap:4px; }
    .attachments .link { background:none; border:0; padding:0; color: rgba(56, 189, 248, 0.95); text-decoration:underline; font-size:14px; cursor:pointer; text-align:left; }
    .checklist { list-style:none; padding-left:0; margin:4px 0 0 0; }
    .check-item { font-size:13px; color: rgba(229, 231, 235, 0.62); }
    .check-item.ok { color: rgba(34, 197, 94, 0.95); }
    .check-item.nok { color: rgba(239, 68, 68, 0.95); }

    @media (max-width: 980px) { .form { grid-template-columns: repeat(2, minmax(0, 1fr)); } .actions { justify-content: stretch; } }
    @media (max-width: 640px) { .form { grid-template-columns: 1fr; } }
  `]
})
export class SoutenanceDoctorantComponent {
  doctorantId: string | null = null;
  soutenances: SoutenanceDTO[] = [];
  encadrants: SimpleUser[] = [];
  current: SoutenanceDTO | null = null;
  selected: SoutenanceDTO | null = null;
  loading = false;
  saving = false;
  submitting = false;
  errorMessage = '';
  successMessage = '';

  editingDraft = false;

  motsClesText = '';

  selectedManuscritFile: File | null = null;
  selectedAntiPlagiatFile: File | null = null;
  selectedAttestationsFile: File | null = null;
  selectedDemandeFile: File | null = null;

  prereqDossier: PrerequisDossier | null = null;
  prereqForm: PrerequisDossierInput = {
    doctorantId: '',
    publicationsCount: 0,
    communicationsCount: 0,
    heuresFormationCumulees: 0,
    dureeDoctoratAnnees: 0
  };
  prereqLoading = false;
  prereqSaving = false;
  prereqError = '';
  prereqSuccess = '';

  form: SoutenanceDraftInput = {
    doctorantId: '',
    directeurId: '',
    titreTheseDefinitif: '',
    resumeFinal: '',
    motsCles: [],
    manuscritPath: '',
    rapportThesePath: '',
    rapportAntiPlagiatPath: '',
    preuvesPublicationsPath: '',
    preuvesCommunicationsPath: '',
    attestationsFormationsPath: '',
    demandeManuscritePath: ''
  };

  constructor(
    private auth: AuthService,
    private users: UsersService,
    private soutenance: SoutenanceService
  ) {
    this.bootstrap();
  }

  private bootstrap() {
    this.loading = true;
    this.auth.me().subscribe({
      next: (me) => {
        this.doctorantId = me.id;
        this.form.doctorantId = me.id;
        this.prereqForm.doctorantId = me.id;
        this.loadSoutenances();
        this.loadPrereqDossier();
      },
      error: () => {
        this.loading = false;
      }
    });

    this.users.listEncadrants().subscribe({
      next: (list) => (this.encadrants = list),
      error: () => console.warn('Impossible de charger les encadrants')
    });
  }

  onSavePrereqDossier() {
    if (!this.doctorantId) {
      return;
    }
    this.prereqError = '';
    this.prereqSuccess = '';
    this.prereqSaving = true;

    const input: PrerequisDossierInput = {
      doctorantId: this.doctorantId,
      publicationsCount: Number(this.prereqForm.publicationsCount || 0),
      communicationsCount: Number(this.prereqForm.communicationsCount || 0),
      heuresFormationCumulees: Number(this.prereqForm.heuresFormationCumulees || 0),
      dureeDoctoratAnnees: Number(this.prereqForm.dureeDoctoratAnnees || 0)
    };

    this.soutenance.savePrerequisDossier(input).subscribe({
      next: (res) => {
        this.prereqSaving = false;
        if (res.errors && res.errors.length > 0) {
          this.prereqError = res.errors[0].message;
          return;
        }
        const dossier = res.data?.savePrerequisDossier || null;
        if (!dossier) {
          this.prereqError = "Réponse invalide du serveur lors de l'enregistrement du dossier de prérequis";
          return;
        }
        this.prereqDossier = dossier;
        this.prereqForm = {
          doctorantId: dossier.doctorantId,
          publicationsCount: dossier.publicationsCount,
          communicationsCount: dossier.communicationsCount,
          heuresFormationCumulees: dossier.heuresFormationCumulees,
          dureeDoctoratAnnees: dossier.dureeDoctoratAnnees
        };
        this.prereqSuccess = 'Dossier de prérequis enregistré avec succès';
      },
      error: (err) => {
        console.error(err);
        this.prereqSaving = false;
        this.prereqError = "Erreur lors de l'enregistrement du dossier de prérequis";
      }
    });
  }

  private loadSoutenances() {
    if (!this.doctorantId) {
      this.loading = false;
      return;
    }
    this.soutenance.listForDoctorant(this.doctorantId).subscribe({
      next: (res) => {
        this.soutenances = res.data?.soutenancesForDoctorant || [];
        this.loading = false;
        if (this.soutenances.length > 0) {
          this.current = this.soutenances.find(s => s.status === 'BROUILLON') || null;
          this.selected = this.soutenances[0];
          this.editingDraft = !!this.current;
        } else {
          this.current = null;
          this.selected = null;
          this.editingDraft = true;
        }
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
      }
    });
  }

  private loadPrereqDossier() {
    if (!this.doctorantId) {
      return;
    }
    this.prereqLoading = true;
    this.prereqError = '';
    this.prereqSuccess = '';
    this.soutenance.getPrerequisDossier(this.doctorantId).subscribe({
      next: (res) => {
        this.prereqLoading = false;
        const dossier = res.data?.prerequisDossierForDoctorant || null;
        this.prereqDossier = dossier;
        if (dossier) {
          this.prereqForm = {
            doctorantId: dossier.doctorantId,
            publicationsCount: dossier.publicationsCount,
            communicationsCount: dossier.communicationsCount,
            heuresFormationCumulees: dossier.heuresFormationCumulees,
            dureeDoctoratAnnees: dossier.dureeDoctoratAnnees
          };
        } else {
          this.prereqForm = {
            doctorantId: this.doctorantId || '',
            publicationsCount: 0,
            communicationsCount: 0,
            heuresFormationCumulees: 0,
            dureeDoctoratAnnees: 0
          };
        }
      },
      error: (err) => {
        console.error(err);
        this.prereqLoading = false;
        this.prereqError = "Erreur lors du chargement du dossier de prérequis";
      }
    });
  }

  onSaveDraft() {
    if (!this.doctorantId) return;
    this.errorMessage = '';
    this.successMessage = '';
    this.saving = true;

    const rawMots = this.motsClesText || '';
    const motsClesList = rawMots
      .split(',')
      .map(m => m.trim())
      .filter(m => m.length > 0);

    const input: SoutenanceDraftInput = {
      doctorantId: this.form.doctorantId,
      directeurId: this.form.directeurId,
      titreTheseDefinitif: this.form.titreTheseDefinitif,
      resumeFinal: this.form.resumeFinal,
      motsCles: motsClesList
    };
    this.soutenance.saveDraft(input).subscribe({
      next: (res) => {
        if (res.errors && res.errors.length > 0) {
          this.saving = false;
          this.errorMessage = res.errors[0].message;
          return;
        }

        const saved = res.data?.saveSoutenanceDraft || null;
        if (!saved) {
          this.saving = false;
          this.errorMessage = "Réponse invalide du serveur lors de l'enregistrement du brouillon";
          return;
        }
        this.current = saved;
        this.selected = saved;
        this.upsertSoutenanceInList(saved);
        const soutenanceId = saved.id;
        const hasFiles = !!(this.selectedManuscritFile || this.selectedAntiPlagiatFile || this.selectedAttestationsFile || this.selectedDemandeFile);

        if (soutenanceId && hasFiles) {
          const formData = new FormData();
          if (this.selectedManuscritFile) {
            formData.append('manuscrit', this.selectedManuscritFile);
          }
          if (this.selectedAntiPlagiatFile) {
            formData.append('rapportAntiPlagiat', this.selectedAntiPlagiatFile);
          }
          if (this.selectedAttestationsFile) {
            formData.append('attestationsFormations', this.selectedAttestationsFile);
          }
          if (this.selectedDemandeFile) {
            formData.append('demandeManuscrite', this.selectedDemandeFile);
          }

          this.soutenance.uploadAttachments(soutenanceId, formData).subscribe({
            next: (updated) => {
              this.saving = false;
              this.current = updated;
              this.selected = updated;
              this.form.manuscritPath = updated.manuscritPath || '';
              this.form.rapportAntiPlagiatPath = updated.rapportAntiPlagiatPath || '';
              this.form.attestationsFormationsPath = updated.attestationsFormationsPath || '';
              this.form.demandeManuscritePath = updated.demandeManuscritePath || '';
              this.successMessage = 'Brouillon et pièces jointes enregistrés avec succès';
              this.editingDraft = false;
              this.clearSelectedFiles();
              this.upsertSoutenanceInList(updated);
            },
            error: (err) => {
              console.error(err);
              this.saving = false;
              this.errorMessage = 'Brouillon enregistré, mais erreur lors du téléversement des fichiers.';
            }
          });
        } else {
          this.saving = false;
          this.successMessage = 'Brouillon enregistré avec succès';
          this.editingDraft = false;
        }
      },
      error: (err) => {
        console.error(err);
        this.saving = false;
        this.errorMessage = "Erreur lors de l'enregistrement du brouillon";
      }
    });
  }

  onFileSelected(event: Event, type: 'manuscrit' | 'antiPlagiat' | 'attestations' | 'demande') {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }
    const file = input.files[0];
    if (type === 'manuscrit') {
      this.selectedManuscritFile = file;
    } else if (type === 'antiPlagiat') {
      this.selectedAntiPlagiatFile = file;
    } else if (type === 'attestations') {
      this.selectedAttestationsFile = file;
    } else if (type === 'demande') {
      this.selectedDemandeFile = file;
    }
  }

  onSubmit(s?: SoutenanceDTO) {
    const target = s || this.current;
    if (!target || !target.id) return;
    if (!this.canSubmitSoutenance()) {
      this.errorMessage = "Vous ne pouvez pas soumettre la soutenance tant que le dossier de prérequis n'est pas validé scientifiquement par votre directeur (publications, communications) et validé administrativement par le service (heures de formation, pièces justificatives). Le système vérifie automatiquement que les seuils exigés (publications, formations, etc.) sont atteints avant d'autoriser la demande.";
      return;
    }
    this.errorMessage = '';
    this.successMessage = '';
    this.submitting = true;
    this.soutenance.submit(target.id).subscribe({
      next: (res) => {
        this.submitting = false;
        if (res.errors && res.errors.length > 0) {
          this.errorMessage = res.errors[0].message;
          return;
        }
        const updated = res.data?.submitSoutenance || null;
        if (updated) {
          this.current = updated;
          this.selected = updated;
          this.upsertSoutenanceInList(updated);
          this.successMessage = 'Soutenance soumise avec succès';
          this.editingDraft = false;
        }
      },
      error: (err) => {
        console.error(err);
        this.submitting = false;
        this.errorMessage = 'Erreur lors de la soumission de la soutenance';
      }
    });
  }

  statusClass(status: string) {
    if (status === 'SOUTENANCE_EFFECTUEE' || status === 'SOUTENANCE_PLANIFIEE' || status === 'JURY_VALIDE' || status === 'SOUTENANCE_AUTORISEE') {
      return 'ok';
    }
    if (status === 'REJETE') {
      return 'err';
    }
    if (status === 'SOUMIS' || status === 'PREREQUIS_EN_VERIFICATION' || status === 'PREREQUIS_VALIDES' || status === 'JURY_PROPOSE') {
      return 'warn';
    }
    return '';
  }

  prereqLocked(): boolean {
    if (!this.prereqDossier) {
      return false;
    }
    return this.prereqDossier.etatScientifique === 'VALIDE' && this.prereqDossier.etatAdministratif === 'VALIDE';
  }

  canSubmitSoutenance(): boolean {
    return this.prereqLocked();
  }

  badgeClassForEtat(etat: string | undefined | null) {
    if (etat === 'VALIDE') {
      return 'ok';
    }
    if (etat === 'REFUSE') {
      return 'err';
    }
    if (etat === 'EN_ATTENTE') {
      return 'warn';
    }
    return '';
  }

  currentStep(): number {
    const s = this.current?.status;
    if (!s) return 0;
    if (s === 'BROUILLON') return 1;
    if (s === 'SOUMIS' || s === 'PREREQUIS_EN_VERIFICATION') return 2;
    if (s === 'PREREQUIS_VALIDES' || s === 'JURY_PROPOSE') return 3;
    if (s === 'JURY_VALIDE') return 4;
    if (s === 'SOUTENANCE_AUTORISEE') return 5;
    if (s === 'PLANIFICATION_PROPOSEE' || s === 'SOUTENANCE_PLANIFIEE' || s === 'SOUTENANCE_EFFECTUEE') return 6;
    return 0;
  }

  timelineClass(step: number) {
    const current = this.currentStep();
    if (current === 0) return '';
    if (step < current) return 'done';
    if (step === current) return 'current';
    return '';
  }

  hasMinPublications(): boolean {
    return (this.prereqForm.publicationsCount || 0) >= 2;
  }

  hasMinCommunications(): boolean {
    return (this.prereqForm.communicationsCount || 0) >= 2;
  }

  hasMinHeuresFormation(): boolean {
    return (this.prereqForm.heuresFormationCumulees || 0) >= 200;
  }

  hasValidDuree(): boolean {
    const d = this.prereqForm.dureeDoctoratAnnees || 0;
    return d > 0 && d <= 6;
  }

  hasManuscrit(): boolean {
    return !!(this.form.manuscritPath || this.selectedManuscritFile);
  }

  hasAntiPlagiat(): boolean {
    return !!(this.form.rapportAntiPlagiatPath || this.selectedAntiPlagiatFile);
  }

  hasAttestations(): boolean {
    return !!(this.form.attestationsFormationsPath || this.selectedAttestationsFile);
  }

  hasDemande(): boolean {
    return !!(this.form.demandeManuscritePath || this.selectedDemandeFile);
  }

  private clearSelectedFiles() {
    this.selectedManuscritFile = null;
    this.selectedAntiPlagiatFile = null;
    this.selectedAttestationsFile = null;
    this.selectedDemandeFile = null;
  }

  private upsertSoutenanceInList(item: SoutenanceDTO | null | undefined) {
    if (!item) {
      return;
    }
    const idx = this.soutenances.findIndex(s => s.id === item.id);
    if (idx >= 0) {
      this.soutenances[idx] = item;
    } else {
      this.soutenances = [item, ...this.soutenances];
    }
  }

  editDraft(s: SoutenanceDTO) {
    if (s.status !== 'BROUILLON') {
      return;
    }
    this.current = s;
    this.selected = s;
    this.form = {
      doctorantId: s.doctorantId,
      directeurId: s.directeurId,
      titreTheseDefinitif: s.titreTheseDefinitif || '',
      resumeFinal: s.resumeFinal || '',
      motsCles: s.motsCles || [],
      manuscritPath: s.manuscritPath || '',
      rapportThesePath: s.rapportThesePath || '',
      rapportAntiPlagiatPath: s.rapportAntiPlagiatPath || '',
      preuvesPublicationsPath: s.preuvesPublicationsPath || '',
      preuvesCommunicationsPath: s.preuvesCommunicationsPath || '',
      attestationsFormationsPath: s.attestationsFormationsPath || '',
      demandeManuscritePath: s.demandeManuscritePath || ''
    };
    this.motsClesText = (this.form.motsCles || []).join(', ');
    this.editingDraft = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  deleteDraft(s: SoutenanceDTO) {
    if (s.status !== 'BROUILLON' || !s.id) {
      return;
    }
    if (!confirm('Voulez-vous vraiment supprimer ce brouillon de soutenance ?')) {
      return;
    }
    this.errorMessage = '';
    this.successMessage = '';
    this.soutenance.deleteDraft(s.id).subscribe({
      next: () => {
        this.soutenances = this.soutenances.filter(x => x.id !== s.id);
        if (this.soutenances.length === 0) {
          this.current = null;
          this.selected = null;
          this.editingDraft = true;
          this.form = {
            doctorantId: this.doctorantId || '',
            directeurId: '',
            titreTheseDefinitif: '',
            resumeFinal: '',
            motsCles: [],
            manuscritPath: '',
            rapportThesePath: '',
            rapportAntiPlagiatPath: '',
            preuvesPublicationsPath: '',
            preuvesCommunicationsPath: '',
            attestationsFormationsPath: '',
            demandeManuscritePath: ''
          };
          this.motsClesText = '';
        } else {
          this.current = this.soutenances.find(x => x.status === 'BROUILLON') || null;
          this.selected = this.soutenances[0];
          this.editingDraft = false;
        }
        this.successMessage = 'Brouillon de soutenance supprimé';
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Erreur lors de la suppression du brouillon de soutenance';
      }
    });
  }

  selectSoutenance(s: SoutenanceDTO) {
    this.selected = s;
    this.editingDraft = false;
  }

  selectedHasAnyAttachment(): boolean {
    const s = this.selected;
    if (!s) return false;
    return !!(s.manuscritPath || s.rapportAntiPlagiatPath || s.attestationsFormationsPath || s.demandeManuscritePath);
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

  downloadAutorisation(s: SoutenanceDTO) {
    if (!s.id) return;
    this.soutenance.downloadAutorisation(s.id).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `autorisation-${s.id}.pdf`;
      a.target = '_blank';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }
}
