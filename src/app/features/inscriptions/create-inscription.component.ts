import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { InscriptionService, CreateInscriptionRequest } from '../../core/services/inscription.service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { UsersService, SimpleUser } from '../../core/services/users.service';

@Component({
  selector: 'app-create-inscription',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="page">
    <div class="card">
      <div class="form-header">
        <h2>Nouvelle inscription</h2>
        <p class="form-subtitle">Remplissez le formulaire pour créer votre candidature au doctorat</p>
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
        <!-- ID doctorant géré automatiquement via le profil, plus affiché dans le formulaire -->

        <div id="step-personal" class="form-section-card" [hidden]="currentStep !== 0">
          <div class="form-section-head">
            <h3 class="form-section-title">Informations Personnelles</h3>
            <p class="form-section-desc">Veuillez renseigner vos informations personnelles</p>
          </div>
          <div class="form-grid">
            <div class="row">
              <label for="nom">Nom complet</label>
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
              <label for="telephone">Téléphone</label>
              <input id="telephone" name="telephone" [(ngModel)]="form.telephone" required class="input" />
            </div>

            <div class="row">
              <label for="emailContact">Email</label>
              <input id="emailContact" name="emailContact" [(ngModel)]="form.emailContact" required class="input" />
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
              <label for="nationalite">Nationalité</label>
              <input id="nationalite" name="nationalite" [(ngModel)]="form.nationalite" required class="input" />
            </div>

            <div class="row">
              <label for="situationFamiliale">Situation familiale</label>
              <input id="situationFamiliale" name="situationFamiliale" [(ngModel)]="form.situationFamiliale" required class="input" />
            </div>

            <div class="row" style="grid-column: 1 / -1;">
              <label for="adresse">Adresse complète</label>
              <input id="adresse" name="adresse" [(ngModel)]="form.adresse" required class="input" />
            </div>
          </div>
        </div>

        <div id="step-academic" class="form-section-card" [hidden]="currentStep !== 1">
          <div class="form-section-head">
            <h3 class="form-section-title">Informations académiques</h3>
            <p class="form-section-desc">Renseignez les informations liées à votre encadrement et votre thèse</p>
          </div>
          <div class="form-grid">
            <div class="row">
              <label for="directeurId">Directeur</label>
              <select id="directeurId" name="directeurId" [(ngModel)]="form.directeurId" required class="input">
                <option value="" disabled selected>-- Sélectionner un encadrant --</option>
                <option *ngFor="let e of encadrants" [value]="e.id">{{ e.firstName }} {{ e.lastName }} ({{ e.email }})</option>
              </select>
            </div>

            <div class="row">
              <label for="coDirecteurId">Co-Directeur (optionnel)</label>
              <select id="coDirecteurId" name="coDirecteurId" [(ngModel)]="form.coDirecteurId" class="input">
                <option value="">-- Aucun --</option>
                <option *ngFor="let e of encadrants" [value]="e.id">{{ e.firstName }} {{ e.lastName }} ({{ e.email }})</option>
              </select>
            </div>

            <div class="row">
              <label for="anneeAcademique">Année académique (ex: 2025-2026)</label>
              <input id="anneeAcademique" name="anneeAcademique" [(ngModel)]="form.anneeAcademique" required class="input" />
            </div>

            <div class="row" style="grid-column: 1 / -1;">
              <label for="sujetThese">Sujet de thèse</label>
              <input id="sujetThese" name="sujetThese" [(ngModel)]="form.sujetThese" required class="input" />
            </div>

            <div class="row" style="grid-column: 1 / -1;">
              <label for="resumeThese">Résumé de la thèse (max 500 mots)</label>
              <textarea id="resumeThese" name="resumeThese" [(ngModel)]="form.resumeThese" maxlength="500" rows="4" class="input"></textarea>
            </div>

            <div class="row">
              <label for="laboratoire">Laboratoire</label>
              <input id="laboratoire" name="laboratoire" [(ngModel)]="form.laboratoire" required class="input" />
            </div>

            <div class="row">
              <label for="specialite">Spécialité</label>
              <input id="specialite" name="specialite" [(ngModel)]="form.specialite" required class="input" />
            </div>
          </div>
        </div>

        <div id="step-docs" class="form-section-card" [hidden]="currentStep !== 2">
          <div class="form-section-head">
            <h3 class="form-section-title">Documents</h3>
            <p class="form-section-desc">Ajoutez les pièces justificatives demandées</p>
          </div>
          <div class="form-grid">
            <div class="row">
              <label>Diplôme Master / équivalent (PDF/JPG)</label>
              <input type="file" accept=".pdf,image/*" (change)="onDiplomeSelected($event)" />
            </div>

            <div class="row">
              <label>CV (PDF/JPG)</label>
              <input type="file" accept=".pdf,image/*" (change)="onCvSelected($event)" />
            </div>

            <div class="row">
              <label>Lettre de motivation (PDF/JPG)</label>
              <input type="file" accept=".pdf,image/*" (change)="onLettreSelected($event)" />
            </div>

            <div class="row">
              <label>Photocopie CIN (PDF/JPG)</label>
              <input type="file" accept=".pdf,image/*" (change)="onCinSelected($event)" />
            </div>
          </div>
        </div>

        <div class="wizard-actions">
          <button type="button" class="btn secondary" (click)="prevStep()" [disabled]="currentStep === 0">Précédent</button>
          <button type="button" class="btn" (click)="nextStep()" *ngIf="currentStep < 2">Suivant</button>
          <button type="submit" class="btn" [disabled]="submitting || uploading" *ngIf="currentStep === 2">Créer</button>
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
      color: var(--foreground);
    }

    .card {
      width: 100%;
      max-width: var(--form-card-max-width);
      background: var(--card-bg);
      border-radius: 18px;
      padding: var(--form-card-padding);
      box-shadow: var(--shadow-soft);
      border: 1px solid var(--border-color);
      backdrop-filter: blur(14px);
      color: rgba(248, 250, 252, 0.92);
    }

    h2 { margin: 0; color: rgba(248, 250, 252, 0.92); }

    .form {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .row {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

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
      background: rgba(2, 6, 23, 0.35);
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

    .footer {
      margin-top: 16px;
      text-align: right;
      font-size: 0.9rem;
    }

    .footer a { color: rgba(56, 189, 248, 0.95); }

    @media (max-width: 980px) { .wizard-actions { flex-direction: column; } }
    @media (max-width: 640px) { .wizard-actions { flex-direction: column; } }
    @media (max-width: 640px) { .card { padding: var(--form-card-padding-mobile); } }
  `]
})
export class CreateInscriptionComponent {
  currentStep = 0;

  private stepIds = ['step-personal', 'step-academic', 'step-docs'];
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
    resumeThese: ''
  };
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

  private isValidAcademicYear(v: string) {
    return /^\d{4}-\d{4}$/.test(v);
  }

  onSubmit() {
    if (this.submitting || this.uploading) return;
    // debug: trace submit flow
    // eslint-disable-next-line no-console
    console.log('[CreateInscription] onSubmit called', this.form);
    if (!this.isValidAcademicYear(this.form.anneeAcademique)) {
      alert("Format d'année académique invalide. Utilisez AAAA-AAAA (ex: 2025-2026).");
      return;
    }
    this.submitting = true;
    // eslint-disable-next-line no-console
    console.log('[CreateInscription] sending create request with form', this.form);
    this.service.create(this.form).subscribe({
      next: (dto) => {
        // eslint-disable-next-line no-console
        console.log('[CreateInscription] create() success', dto);
        const id = dto?.id;
        if (id) {
          // Toujours appeler l'upload, FormData ne contiendra que les fichiers réellement sélectionnés
          this.uploading = true;
          const files: File[] = [];
          if (this.diplomeFile) files[0] = this.diplomeFile;
          if (this.cvFile) files[1] = this.cvFile;
          if (this.lettreMotivationFile) files[2] = this.lettreMotivationFile;
          if (this.cinFile) files[3] = this.cinFile;
          // eslint-disable-next-line no-console
          console.log('[CreateInscription] calling uploadAttachments with', { id, files });
          this.service.uploadAttachments(id, files).subscribe({
            next: () => {
              // eslint-disable-next-line no-console
              console.log('[CreateInscription] uploadAttachments() success');
              this.uploading = false;
              this.submitting = false;
              alert('Inscription créée et documents téléversés avec succès');
              // eslint-disable-next-line no-console
              console.log('[CreateInscription] navigating to /dashboard/doctorant (upload ok)');
              this.router.navigate(['/dashboard', 'doctorant']);
            },
            error: (e) => {
              this.uploading = false;
              this.submitting = false;
              console.error(e);
              alert("Inscription créée, mais échec du téléversement des documents");
              // eslint-disable-next-line no-console
              console.log('[CreateInscription] navigating to /dashboard/doctorant (upload error)');
              this.router.navigate(['/dashboard', 'doctorant']);
            }
          });
        } else {
          // Cas de sécurité: pas d'id retourné
          this.submitting = false;
          alert("Erreur: l'identifiant de l'inscription n'a pas été retourné par le serveur");
        }
      },
      error: (err) => {
        this.submitting = false;
        console.error(err);
        alert("Erreur lors de la création de l'inscription");
        // eslint-disable-next-line no-console
        console.log('[CreateInscription] navigating to /dashboard/doctorant (create error)');
        this.router.navigate(['/dashboard', 'doctorant']);
      },
    });
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
