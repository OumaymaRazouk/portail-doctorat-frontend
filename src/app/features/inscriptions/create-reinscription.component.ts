import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InscriptionService, CreateInscriptionRequest } from '../../core/services/inscription.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { UsersService, SimpleUser } from '../../core/services/users.service';

@Component({
  selector: 'app-create-reinscription',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="page">
    <div class="card">
      <div class="form-header">
        <h2>Nouvelle réinscription</h2>
        <p class="form-subtitle">Remplissez le formulaire pour créer votre réinscription annuelle</p>
      </div>

      <div class="form-stepper">
        <button type="button" class="form-step" (click)="setStep(0)" [class.active]="currentStep === 0" [class.done]="currentStep > 0">
          <div class="form-step-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="form-step-label">Informations<br>personnelles</div>
        </button>
        <button type="button" class="form-step" (click)="setStep(1)" [class.active]="currentStep === 1" [class.done]="currentStep > 1">
          <div class="form-step-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 19V7a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M8 5V3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M16 5V3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M4 11h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="form-step-label">Informations<br>académiques</div>
        </button>
        <button type="button" class="form-step" (click)="setStep(2)" [class.active]="currentStep === 2" [class.done]="false">
          <div class="form-step-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <path d="M14 2v6h6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="form-step-label">Documents</div>
        </button>
      </div>

      <form (ngSubmit)="onSubmit()" class="form">
        <div id="re-step-personal" [hidden]="currentStep !== 0">
          <div class="section">
            <h3>Données d'identité (pré-remplies et verrouillées après pré-remplissage)</h3>
          <div class="row">
            <label for="doctorantId">ID Doctorant</label>
            <input id="doctorantId" name="doctorantId" [(ngModel)]="form.doctorantId" required class="input" [readonly]="true" />
          </div>
          <div class="row">
            <label for="nom">Nom et prénom</label>
            <input id="nom" name="nom" [(ngModel)]="form.nom" required class="input" />
          </div>
          <div class="row">
            <label for="cin">CIN / Carte d'identité</label>
            <input id="cin" name="cin" [(ngModel)]="form.cin" required class="input" />
          </div>
          <div class="row">
            <label for="cne">CNE (Code National Étudiant)</label>
            <input id="cne" name="cne" [(ngModel)]="form.cne" required class="input" />
          </div>
          <div class="row">
            <label for="dateNaissance">Date de naissance</label>
            <input id="dateNaissance" name="dateNaissance" type="date" [(ngModel)]="form.dateNaissance" required class="input" />
          </div>
          <div class="row">
            <label for="lieuNaissance">Lieu de naissance</label>
            <input id="lieuNaissance" name="lieuNaissance" [(ngModel)]="form.lieuNaissance" required class="input" />
          </div>
          <div class="row">
            <label for="directeurId">Directeur</label>
            <select id="directeurId" name="directeurId" [(ngModel)]="form.directeurId" required class="input" [disabled]="lockedAfterPrefill">
              <option value="" disabled selected>-- Sélectionner un encadrant --</option>
              <option *ngFor="let e of encadrants" [value]="e.id">{{ e.firstName }} {{ e.lastName }} ({{ e.email }})</option>
            </select>
          </div>
          <div class="row">
            <label for="sujetThese">Sujet de thèse</label>
            <input id="sujetThese" name="sujetThese" [(ngModel)]="form.sujetThese" required class="input" [readonly]="lockedAfterPrefill" />
          </div>
          </div>

          <div class="section">
            <h3>Mises à jour de contact</h3>
          <div class="row">
            <label for="telephone">Téléphone</label>
            <input id="telephone" name="telephone" [(ngModel)]="form.telephone" required class="input" />
          </div>
          <div class="row">
            <label for="emailContact">Email</label>
            <input id="emailContact" name="emailContact" [(ngModel)]="form.emailContact" required class="input" />
          </div>
          <div class="row">
            <label for="adresse">Adresse complète</label>
            <input id="adresse" name="adresse" [(ngModel)]="form.adresse" required class="input" />
          </div>
          </div>
        </div>

        <div id="re-step-academic" [hidden]="currentStep !== 1">
          <div class="section">
            <h3>Informations complémentaires</h3>
          <div class="row">
            <label for="nationalite">Nationalité</label>
            <input id="nationalite" name="nationalite" [(ngModel)]="form.nationalite" required class="input" />
          </div>
          <div class="row">
            <label for="situationFamiliale">Situation familiale</label>
            <input id="situationFamiliale" name="situationFamiliale" [(ngModel)]="form.situationFamiliale" required class="input" />
          </div>
          <div class="row">
            <label for="laboratoire">Laboratoire</label>
            <input id="laboratoire" name="laboratoire" [(ngModel)]="form.laboratoire" required class="input" />
          </div>
          <div class="row">
            <label for="specialite">Spécialité</label>
            <input id="specialite" name="specialite" [(ngModel)]="form.specialite" required class="input" />
          </div>
          <div class="row">
            <label for="anneeAcademique">Année académique (ex: 2025-2026)</label>
            <input id="anneeAcademique" name="anneeAcademique" [(ngModel)]="form.anneeAcademique" required class="input" />
          </div>
          <div class="row">
            <label for="resumeThese">Résumé de la thèse (max 500 mots)</label>
            <textarea id="resumeThese" name="resumeThese" [(ngModel)]="form.resumeThese" maxlength="500" rows="4" class="input"></textarea>
          </div>
          </div>

          <div class="section">
            <h3>Avancement de la thèse (N-1)</h3>
          <div class="row">
            <label for="rapportAvancement">Résumé du rapport d'avancement</label>
            <textarea id="rapportAvancement" name="rapportAvancement" [(ngModel)]="form.rapportAvancement" rows="4" class="input"></textarea>
          </div>
          <div class="row">
            <label for="publicationsN1">Publications N-1</label>
            <textarea id="publicationsN1" name="publicationsN1" [(ngModel)]="form.publicationsN1" rows="3" class="input"></textarea>
          </div>
          <div class="row">
            <label for="communicationsN1">Communications N-1</label>
            <textarea id="communicationsN1" name="communicationsN1" [(ngModel)]="form.communicationsN1" rows="3" class="input"></textarea>
          </div>
          <div class="row">
            <label for="heuresFormationCumulees">Heures de formation cumulées</label>
            <input id="heuresFormationCumulees" name="heuresFormationCumulees" [(ngModel)]="form.heuresFormationCumulees" class="input" />
          </div>
          </div>
        </div>

        <div id="re-step-docs" [hidden]="currentStep !== 2">
          <div class="section">
            <h3>Pièces justificatives (PDF/JPG)</h3>
          <div class="row">
            <label>Rapport d'avancement annuel</label>
            <input type="file" accept=".pdf,image/*" (change)="onDiplomeSelected($event)" />
          </div>
          <div class="row">
            <label>Attestations formations suivies N-1</label>
            <input type="file" accept=".pdf,image/*" (change)="onCvSelected($event)" />
          </div>
          <div class="row">
            <label>Preuves publications / communications</label>
            <input type="file" accept=".pdf,image/*" (change)="onLettreSelected($event)" />
          </div>
          <div class="row">
            <label>Autre justificatif (optionnel)</label>
            <input type="file" accept=".pdf,image/*" (change)="onCinSelected($event)" />
          </div>
          </div>
        </div>

        <div class="wizard-actions">
          <button type="button" class="btn secondary" (click)="prevStep()" [disabled]="currentStep === 0">Précédent</button>
          <button type="button" class="btn" (click)="nextStep()" *ngIf="currentStep < 2">Suivant</button>
          <ng-container *ngIf="currentStep === 2">
            <button type="submit" class="btn" [disabled]="submitting || uploading">Enregistrer le brouillon</button>
            <button type="button" class="btn secondary" (click)="onPrefill()">Pré-remplir depuis N-1</button>
          </ng-container>
        </div>
      </form>

      <div class="footer">
        <a routerLink="/dashboard/doctorant">Retour au tableau de bord</a>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .page {
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      padding: 24px;
      background: transparent;
    }

    .card {
      width: 100%;
      max-width: 960px;
      background: var(--card-bg);
      border-radius: 18px;
      padding: 2rem 2.5rem;
      box-shadow: var(--shadow-soft);
      border: 1px solid var(--border-color);
      backdrop-filter: blur(14px);
    }

    h2 { margin: 0; color: rgba(248, 250, 252, 0.92); }

    .form { display: flex; flex-direction: column; gap: 18px; }

    .section {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px 16px;
      padding-top: 12px;
      border-top: 1px solid var(--border-color);
    }

    .section h3 {
      grid-column: 1 / -1;
      margin: 0;
      font-size: 0.95rem;
      color: rgba(248, 250, 252, 0.88);
    }

    .row { min-width: 0; display: flex; flex-direction: column; gap: 8px; }

    label {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: rgba(248, 250, 252, 0.82);
      font-weight: 600;
    }

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
      border: 1px solid var(--border-color);
      border-radius: 10px;
      font-size: 14px;
      background: rgba(2, 6, 23, 0.45);
      color: rgba(248, 250, 252, 0.92);
      outline: none;
    }

    .input:focus {
      border-color: rgba(20, 184, 166, 0.65);
      box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.18);
    }

    .btn {
      margin-top: 8px;
      background: var(--primary);
      color: var(--primary-foreground);
      border: 0;
      border-radius: 999px;
      padding: 10px 18px;
      cursor: pointer;
      font-size: 0.9rem;
      font-weight: 500;
      transition: background-color 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease;
    }

    .btn.secondary { background: rgba(56, 189, 248, 0.20); color: rgba(248, 250, 252, 0.92); border: 1px solid rgba(56, 189, 248, 0.28); }

    .wizard-actions {
      display: flex;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 6px;
    }

    .wizard-actions .btn {
      margin-top: 0;
      min-width: 160px;
    }

    .btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(15, 23, 42, 0.18);
    }

    .actions { margin-top: 8px; }

    .form .actions {
      grid-column: 1 / -1;
      display: flex;
      gap: 10px;
      justify-content: flex-end;
      flex-wrap: wrap;
    }

    .footer {
      margin-top: 16px;
      text-align: right;
      font-size: 0.9rem;
    }

    .footer a { color: rgba(56, 189, 248, 0.95); }

    @media (max-width: 980px) {
      .section { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .form .actions { justify-content: stretch; }
    }

    @media (max-width: 640px) {
      .section { grid-template-columns: 1fr; }
    }
    @media (max-width: 980px) { .wizard-actions { flex-direction: column; } }
    @media (max-width: 640px) { .wizard-actions { flex-direction: column; } }
    @media (max-width: 640px) { .card { padding: var(--form-card-padding-mobile); } }
  `]
})
export class CreateReinscriptionComponent {
  currentStep = 0;
  private stepIds = ['re-step-personal', 're-step-academic', 're-step-docs'];
  encadrants: SimpleUser[] = [];
  form: CreateInscriptionRequest = {
    doctorantId: '',
    directeurId: '',
    coDirecteurId: '',
    sujetThese: '',
    laboratoire: '',
    specialite: '',
    anneeAcademique: '',
    nom: '',
    cin: '',
    telephone: '',
    emailContact: '',
    cne: '',
    dateNaissance: '',
    lieuNaissance: '',
    nationalite: '',
    adresse: '',
    situationFamiliale: '',
    resumeThese: '',
    rapportAvancement: '',
    publicationsN1: '',
    communicationsN1: '',
    heuresFormationCumulees: ''
  };
  currentInscriptionId?: string;
  lockedAfterPrefill = false;
  diplomeFile?: File;
  cvFile?: File;
  lettreMotivationFile?: File;
  cinFile?: File;
  submitting = false;
  uploading = false;

  setStep(step: number) {
    const next = Math.max(0, Math.min(2, step));
    this.currentStep = next;
    this.scrollToCurrentStep();
  }

  nextStep() {
    this.setStep(this.currentStep + 1);
  }

  prevStep() {
    this.setStep(this.currentStep - 1);
  }

  private scrollToCurrentStep() {
    if (typeof document === 'undefined') return;
    const id = this.stepIds[this.currentStep];
    setTimeout(() => {
      const el = document.getElementById(id);
      el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  constructor(
    private service: InscriptionService,
    private router: Router,
    private auth: AuthService,
    private users: UsersService
  ) {
    this.bootstrap();
  }

  private bootstrap() {
    this.auth.me().subscribe({
      next: (me) => (this.form.doctorantId = me.id),
      error: () => console.warn('Impossible de charger le profil utilisateur'),
    });
    this.users.listEncadrants().subscribe({
      next: (list) => (this.encadrants = list),
      error: () => console.warn('Impossible de charger les encadrants'),
    });
  }

  private isValidAcademicYear(v: string) { return /^\d{4}-\d{4}$/.test(v); }

  onSubmit() {
    if (this.submitting || this.uploading) return;
    if (!this.isValidAcademicYear(this.form.anneeAcademique)) {
      alert("Format d'année académique invalide. Utilisez AAAA-AAAA (ex: 2025-2026).");
      return;
    }
    this.submitting = true;
    // eslint-disable-next-line no-console
    console.log('[CreateReinscription] onSubmit called', this.form, 'currentId=', this.currentInscriptionId);
    const request$ = this.currentInscriptionId
      ? this.service.update(this.currentInscriptionId, this.form)
      : this.service.createReinscription(this.form);

    request$.subscribe({
      next: (dto) => {
        // eslint-disable-next-line no-console
        console.log('[CreateReinscription] request success', dto);
        const id = dto?.id || this.currentInscriptionId;
        if (id && (this.diplomeFile || this.cvFile || this.lettreMotivationFile || this.cinFile)) {
          this.uploading = true;
          const files: File[] = [];
          if (this.diplomeFile) files[0] = this.diplomeFile;
          if (this.cvFile) files[1] = this.cvFile;
          if (this.lettreMotivationFile) files[2] = this.lettreMotivationFile;
          if (this.cinFile) files[3] = this.cinFile;
          this.service.uploadAttachments(id, files).subscribe({
            next: () => {
              this.uploading = false; this.submitting = false;
              alert('Réinscription créée et documents téléversés avec succès');
              // eslint-disable-next-line no-console
              console.log('[CreateReinscription] navigating to /dashboard/doctorant (upload ok)');
              this.router.navigate(['/dashboard', 'doctorant']);
            },
            error: (e) => {
              this.uploading = false; this.submitting = false;
              console.error(e);
              alert('Réinscription créée, mais échec du téléversement des documents');
              // eslint-disable-next-line no-console
              console.log('[CreateReinscription] navigating to /dashboard/doctorant (upload error)');
              this.router.navigate(['/dashboard', 'doctorant']);
            }
          })
        } else {
          this.submitting = false;
          alert('Réinscription enregistrée avec succès');
          // eslint-disable-next-line no-console
          console.log('[CreateReinscription] navigating to /dashboard/doctorant (no files)');
          this.router.navigate(['/dashboard', 'doctorant']);
        }
      },
      error: (err) => {
        this.submitting = false;
        console.error(err);
        alert("Erreur lors de la création de la réinscription");
        // eslint-disable-next-line no-console
        console.log('[CreateReinscription] navigating to /dashboard/doctorant (request error)');
        this.router.navigate(['/dashboard', 'doctorant']);
      },
    });
  }

  onPrefill() {
    const nextYear = this.form.anneeAcademique;
    if (!nextYear) {
      alert("Veuillez d'abord saisir l'année académique (ex: 2025-2026).");
      return;
    }
    if (!this.form.doctorantId) {
      alert("Profil doctorant non chargé. Veuillez vous reconnecter.");
      return;
    }
    this.service.prefill(this.form.doctorantId, nextYear).subscribe({
      next: (dto) => {
        this.currentInscriptionId = dto.id;
        this.lockedAfterPrefill = true;
        this.form = {
          doctorantId: dto.doctorantId,
          directeurId: dto.directeurId,
          coDirecteurId: dto.coDirecteurId,
          sujetThese: dto.sujetThese,
          laboratoire: dto.laboratoire,
          specialite: dto.specialite,
          anneeAcademique: nextYear,
          nom: dto.nom || '',
          cin: dto.cin || '',
          telephone: dto.telephone || '',
          emailContact: dto.emailContact || '',
          cne: dto.cne || '',
          dateNaissance: dto.dateNaissance || '',
          lieuNaissance: dto.lieuNaissance || '',
          nationalite: dto.nationalite || '',
          adresse: dto.adresse || '',
          situationFamiliale: dto.situationFamiliale || '',
          resumeThese: dto.resumeThese || '',
          rapportAvancement: '',
          publicationsN1: '',
          communicationsN1: '',
          heuresFormationCumulees: ''
        };
      },
      error: (err) => {
        console.error(err);
        const msg = err?.error?.message || 'Pré-remplissage impossible';
        alert(msg);
      }
    })
  }

  onDiplomeSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.diplomeFile = input.files && input.files.length > 0 ? input.files[0] : undefined;
  }

  onCvSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.cvFile = input.files && input.files.length > 0 ? input.files[0] : undefined;
  }

  onLettreSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.lettreMotivationFile = input.files && input.files.length > 0 ? input.files[0] : undefined;
  }

  onCinSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    this.cinFile = input.files && input.files.length > 0 ? input.files[0] : undefined;
  }
}
