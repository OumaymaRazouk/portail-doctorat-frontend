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
      <h2>Nouvelle réinscription</h2>

      <form (ngSubmit)="onSubmit()" class="form">
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

        <div class="row actions" style="display:flex; gap:8px; align-items:center;">
          <button type="submit" class="btn" [disabled]="submitting || uploading">Enregistrer le brouillon</button>
          <button type="button" class="btn secondary" (click)="onPrefill()">Pré-remplir depuis N-1</button>
        </div>
      </form>

      <div class="footer">
        <a routerLink="/dashboard/doctorant">Retour au tableau de bord</a>
      </div>
    </div>
  </div>
  `,
  styles: [`
    .page { min-height: 100vh; display: flex; justify-content: center; align-items: flex-start; padding: 24px; background: #f7fafc; }
    .card { width: 100%; max-width: 640px; background: #fff; border-radius: 12px; padding: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.08); }
    h2 { margin: 0 0 16px; }
    .form { display: flex; flex-direction: column; gap: 12px; }
    .row { display: flex; flex-direction: column; gap: 6px; }
    label { font-size: 13px; color: #4a5568; }
    .input { padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; }
    .btn { margin-top: 8px; background: #4f46e5; color: white; border: 0; border-radius: 8px; padding: 10px 12px; cursor: pointer; }
    .btn:hover { background: #4338ca; }
    .btn.secondary { background: #0ea5e9; }
    .btn.secondary:hover { background: #0284c7; }
    .section { margin-top: 12px; border-top: 1px solid #e5e7eb; padding-top: 12px; }
    .section h3 { margin: 0 0 8px; font-size: 14px; color: #111827; }
    .actions { margin-top: 8px; }
    .footer { margin-top: 16px; text-align: right; }
  `]
})
export class CreateReinscriptionComponent {
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
    const request$ = this.currentInscriptionId
      ? this.service.update(this.currentInscriptionId, this.form)
      : this.service.createReinscription(this.form);

    request$.subscribe({
      next: (dto) => {
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
              this.router.navigateByUrl('/dashboard/doctorant');
            },
            error: (e) => {
              this.uploading = false; this.submitting = false;
              console.error(e);
              alert('Réinscription créée, mais échec du téléversement des documents');
              this.router.navigateByUrl('/dashboard/doctorant');
            }
          })
        } else {
          this.submitting = false;
          alert('Réinscription enregistrée avec succès');
          this.router.navigateByUrl('/dashboard/doctorant');
        }
      },
      error: (err) => {
        this.submitting = false;
        console.error(err);
        alert("Erreur lors de la création de la réinscription");
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
