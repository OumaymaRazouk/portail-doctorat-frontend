import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LayoutComponent } from '../components/layout.component';
import { AuthService } from '../../core/services/auth.service';
import { UsersService, SimpleUser } from '../../core/services/users.service';
import { SoutenanceService, SoutenanceDTO, SoutenanceDraftInput } from '../../core/services/soutenance.service';

@Component({
  selector: 'app-soutenance-doctorant',
  standalone: true,
  imports: [LayoutComponent, CommonModule, FormsModule],
  template: `
    <app-layout title="Ma soutenance">
      <div *ngIf="loading" class="info">Chargement...</div>

      <div *ngIf="!loading" class="content-wrapper">
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
              <div><span class="label">Publications (Q1/Q2)</span><span class="value">{{ selected.publicationsCount }}</span></div>
              <div><span class="label">Communications</span><span class="value">{{ selected.communicationsCount }}</span></div>
              <div><span class="label">Heures de formation cumulées</span><span class="value">{{ selected.heuresFormationCumulees }}</span></div>
              <div><span class="label">Durée du doctorat (années)</span><span class="value">{{ selected.dureeDoctoratAnnees }}</span></div>
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

          <!-- Formulaire visible seulement si aucune soutenance n'existe encore ou si la soutenance courante est un brouillon -->
          <form (ngSubmit)="onSaveDraft()" class="form" *ngIf="doctorantId && (soutenances.length === 0 || editingDraft)">
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
              <button type="button" class="btn secondary" (click)="onSubmit()" [disabled]="submitting || !current || current.status !== 'BROUILLON'">
                Soumettre la soutenance
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
      background: #fff;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
    }
    .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
    .section { margin-top:12px; }
    .section h5 { margin:0 0 8px; font-size:15px; }
    .status-card h4 { margin-top: 0; }
    .form { display: flex; flex-direction: column; gap: 12px; }
    .row { display: flex; flex-direction: column; gap: 6px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
    .col-2 { grid-column: span 2; }
    .label { display:block; font-size:12px; color:#6b7280; margin-bottom:2px; }
    .value { font-size:14px; color:#111827; word-break:break-word; }
    label { font-size: 13px; color: #4a5568; }
    .input { padding: 8px 10px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 14px; }
    .btn { background:#4f46e5; color:#fff; padding:8px 12px; border-radius:8px; border:0; cursor:pointer; }
    .btn.secondary { background:#0ea5e9; }
    .actions { display:flex; gap:8px; margin-top:8px; }
    .badge { padding:4px 8px; border-radius:6px; background:#e5e7eb; font-size:12px; }
    .badge.ok { background:#dcfce7; color:#166534; }
    .badge.warn { background:#fef9c3; color:#854d0e; }
    .badge.err { background:#fee2e2; color:#991b1b; }
    .table { width:100%; border-collapse:collapse; margin-top:8px; }
    th, td { padding:8px 10px; border-bottom:1px solid #e5e7eb; text-align:left; }
    .row-clickable { cursor:pointer; }
    .row-clickable:hover { background:#f9fafb; }
    .error { margin-top:8px; color:#b91c1c; font-size:13px; }
    .success { margin-top:8px; color:#166534; font-size:13px; }
    .info { font-size: 14px; }
    .timeline { list-style:none; padding:0; margin:8px 0 0 0; }
    .timeline-step { padding:4px 0; font-size:13px; color:#4b5563; }
    .timeline-step.done { color:#16a34a; }
    .timeline-step.current { font-weight:600; color:#1d4ed8; }
    .attachments { list-style:none; padding-left:0; margin:0; display:flex; flex-direction:column; gap:4px; }
    .attachments .link { background:none; border:0; padding:0; color:#2563eb; text-decoration:underline; font-size:14px; cursor:pointer; text-align:left; }
    .checklist { list-style:none; padding-left:0; margin:4px 0 0 0; }
    .check-item { font-size:13px; color:#4b5563; }
    .check-item.ok { color:#16a34a; }
    .check-item.nok { color:#b91c1c; }
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

  form: SoutenanceDraftInput & { directeurId: string } = {
    doctorantId: '',
    directeurId: '',
    titreTheseDefinitif: '',
    resumeFinal: '',
    motsCles: [],
    publicationsCount: 0,
    communicationsCount: 0,
    heuresFormationCumulees: 0,
    dureeDoctoratAnnees: 3,
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
        this.loadSoutenances();
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

  private loadSoutenances() {
    if (!this.doctorantId) { this.loading = false; return; }
    this.soutenance.listForDoctorant(this.doctorantId).subscribe({
      next: (res) => {
        const list = res.data?.soutenancesForDoctorant || [];
        this.soutenances = list;
        this.current = list.find(s => s.status === 'BROUILLON') || null;
        this.selected = list.length > 0 ? list[0] : null;
        this.editingDraft = list.length === 0;

        if (this.current) {
          this.form = {
            doctorantId: this.current.doctorantId,
            directeurId: this.current.directeurId,
            titreTheseDefinitif: this.current.titreTheseDefinitif || '',
            resumeFinal: this.current.resumeFinal || '',
            motsCles: this.current.motsCles || [],
            publicationsCount: this.current.publicationsCount,
            communicationsCount: this.current.communicationsCount,
            heuresFormationCumulees: this.current.heuresFormationCumulees,
            dureeDoctoratAnnees: this.current.dureeDoctoratAnnees,
            manuscritPath: this.current.manuscritPath || '',
            rapportThesePath: this.current.rapportThesePath || '',
            rapportAntiPlagiatPath: this.current.rapportAntiPlagiatPath || '',
            preuvesPublicationsPath: this.current.preuvesPublicationsPath || '',
            preuvesCommunicationsPath: this.current.preuvesCommunicationsPath || '',
            attestationsFormationsPath: this.current.attestationsFormationsPath || '',
            demandeManuscritePath: this.current.demandeManuscritePath || ''
          };
          this.motsClesText = (this.form.motsCles || []).join(', ');
        } else {
          this.form = {
            doctorantId: this.doctorantId || '',
            directeurId: '',
            titreTheseDefinitif: '',
            resumeFinal: '',
            motsCles: [],
            publicationsCount: 0,
            communicationsCount: 0,
            heuresFormationCumulees: 0,
            dureeDoctoratAnnees: 3,
            manuscritPath: '',
            rapportThesePath: '',
            rapportAntiPlagiatPath: '',
            preuvesPublicationsPath: '',
            preuvesCommunicationsPath: '',
            attestationsFormationsPath: '',
            demandeManuscritePath: ''
          };
          this.motsClesText = '';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
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

    this.errorMessage = '';
    this.successMessage = '';
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
      motsCles: motsClesList,
      publicationsCount: Number(this.form.publicationsCount || 0),
      communicationsCount: Number(this.form.communicationsCount || 0),
      heuresFormationCumulees: Number(this.form.heuresFormationCumulees || 0),
      dureeDoctoratAnnees: Number(this.form.dureeDoctoratAnnees || 0)
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

  onSubmit() {
    if (!this.current) return;
    this.errorMessage = '';
    this.successMessage = '';
    this.submitting = true;
    this.soutenance.submit(this.current.id).subscribe({
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
    return (this.form.publicationsCount || 0) >= 2;
  }

  hasMinCommunications(): boolean {
    return (this.form.communicationsCount || 0) >= 2;
  }

  hasMinHeuresFormation(): boolean {
    return (this.form.heuresFormationCumulees || 0) >= 200;
  }

  hasValidDuree(): boolean {
    const d = this.form.dureeDoctoratAnnees || 0;
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
      publicationsCount: s.publicationsCount,
      communicationsCount: s.communicationsCount,
      heuresFormationCumulees: s.heuresFormationCumulees,
      dureeDoctoratAnnees: s.dureeDoctoratAnnees,
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
            publicationsCount: 0,
            communicationsCount: 0,
            heuresFormationCumulees: 0,
            dureeDoctoratAnnees: 3,
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
