import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InscriptionService, CreateInscriptionRequest } from '../../core/services/inscription.service';

@Component({
  selector: 'app-edit-inscription',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="page">
    <div class="card">
      <div class="form-header">
        <h2>Modifier ma candidature</h2>
        <p class="form-subtitle">Mettez à jour vos informations avant soumission</p>
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

      <form (ngSubmit)="onSubmit()" class="form" *ngIf="loaded">
        <div id="edit-step-personal" class="form-section-card" [hidden]="currentStep !== 0">
          <div class="form-section-head">
            <h3 class="form-section-title">Informations Personnelles</h3>
            <p class="form-section-desc">Vérifiez et corrigez vos données personnelles</p>
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

        <div id="edit-step-academic" class="form-section-card" [hidden]="currentStep !== 1">
          <div class="form-section-head">
            <h3 class="form-section-title">Informations académiques</h3>
            <p class="form-section-desc">Mettez à jour les informations de thèse si besoin</p>
          </div>
          <div class="form-grid">
            <div class="row">
              <label for="directeurId">Directeur</label>
              <select id="directeurId" name="directeurId" [(ngModel)]="form.directeurId" required class="input">
                <option value="" disabled>-- Sélectionner un encadrant --</option>
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

        <div id="edit-step-docs" class="form-section-card" [hidden]="currentStep !== 2">
          <div class="form-section-head">
            <h3 class="form-section-title">Documents</h3>
            <p class="form-section-desc">Aucune modification de documents sur cette page</p>
          </div>
          <div style="padding: 0 6px; color: rgba(248, 250, 252, 0.70); font-size: 0.92rem;">
            Vous pouvez soumettre vos modifications maintenant.
          </div>
        </div>

        <div class="wizard-actions">
          <button type="button" class="btn secondary" (click)="prevStep()" [disabled]="currentStep === 0">Précédent</button>
          <button type="button" class="btn" (click)="nextStep()" *ngIf="currentStep < 2">Suivant</button>
          <button type="submit" class="btn" [disabled]="saving" *ngIf="currentStep === 2">Enregistrer</button>
        </div>
      </form>

      <div *ngIf="!loaded">Chargement...</div>

      <div class="footer">
        <a routerLink="/dashboard/doctorant">Retour au tableau de bord</a>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .page { min-height: 100vh; display: flex; justify-content: center; align-items: flex-start; padding: 24px; background: transparent; color: var(--foreground); }
    .card { width: 100%; max-width: var(--form-card-max-width); background: var(--card-bg); border-radius: 18px; padding: var(--form-card-padding); box-shadow: var(--shadow-soft); border: 1px solid var(--border-color); backdrop-filter: blur(14px); color: rgba(248, 250, 252, 0.92); }
    h2 { margin: 0; color: rgba(248, 250, 252, 0.92); }
    .form { display: flex; flex-direction: column; gap: 14px; }
    .row { min-width: 0; display: flex; flex-direction: column; gap: 8px; }
    label { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; color: rgba(248, 250, 252, 0.82); font-weight: 600; }
    label::before { content: ''; width: 18px; height: 18px; border-radius: 999px; background: rgba(148, 163, 184, 0.12); border: 1px solid rgba(148, 163, 184, 0.18); box-shadow: inset 0 1px 0 rgba(248, 250, 252, 0.06); flex-shrink: 0; }
    .input { padding: 10px 12px; border: 1px solid var(--border-color); border-radius: 10px; font-size: 14px; background: rgba(2, 6, 23, 0.35); color: rgba(248, 250, 252, 0.92); outline: none; }
    .input:focus { border-color: rgba(20, 184, 166, 0.65); box-shadow: 0 0 0 3px rgba(20, 184, 166, 0.18); }
    .btn { margin-top: 8px; background: var(--primary); color: var(--primary-foreground); border: 0; border-radius: 999px; padding: 10px 14px; cursor: pointer; font-weight: 600; }
    .btn.secondary { background: rgba(56, 189, 248, 0.20); color: rgba(248, 250, 252, 0.92); border: 1px solid rgba(56, 189, 248, 0.28); }

    .wizard-actions { display: flex; justify-content: space-between; gap: 10px; margin-top: 6px; }
    .wizard-actions .btn { margin-top: 0; }
    .btn:hover { transform: translateY(-1px); box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35); }
    .footer { margin-top: 16px; text-align: right; }
    .footer a { color: rgba(56, 189, 248, 0.95); }

    @media (max-width: 980px) { .wizard-actions { flex-direction: column; } }
    @media (max-width: 640px) { .wizard-actions { flex-direction: column; } }
    @media (max-width: 640px) { .card { padding: var(--form-card-padding-mobile); } }
  `]
})
export class EditInscriptionComponent {
  currentStep = 0;
  private stepIds = ['edit-step-personal', 'edit-step-academic', 'edit-step-docs'];
  inscriptionId: string | null = null;
  loaded = false;
  saving = false;

  encadrants: any[] = [];
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
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.bootstrap();
  }

  private bootstrap() {
    this.inscriptionId = this.route.snapshot.paramMap.get('id');
    if (!this.inscriptionId) {
      this.router.navigateByUrl('/dashboard/doctorant');
      return;
    }

    this.service.getById(this.inscriptionId).subscribe({
      next: (dto) => {
        this.form = {
          doctorantId: dto.doctorantId,
          directeurId: dto.directeurId,
          coDirecteurId: dto.coDirecteurId || '',
          sujetThese: dto.sujetThese,
          laboratoire: dto.laboratoire,
          specialite: dto.specialite,
          anneeAcademique: dto.anneeAcademique,
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
          resumeThese: dto.resumeThese || ''
        };
        this.loaded = true;
      },
      error: () => {
        this.router.navigateByUrl('/dashboard/doctorant');
      }
    });
  }

  private isValidAcademicYear(v: string) {
    return /^\d{4}-\d{4}$/.test(v);
  }

  onSubmit() {
    if (this.saving || !this.inscriptionId) return;
    if (!this.isValidAcademicYear(this.form.anneeAcademique)) {
      alert("Format d'année académique invalide. Utilisez AAAA-AAAA (ex: 2025-2026).");
      return;
    }
    this.saving = true;
    this.service.update(this.inscriptionId, this.form).subscribe({
      next: () => {
        this.saving = false;
        alert('Candidature mise à jour avec succès');
        this.router.navigateByUrl('/dashboard/doctorant');
      },
      error: (err) => {
        this.saving = false;
        console.error(err);
        alert("Erreur lors de la mise à jour de l'inscription");
      }
    });
  }
}
