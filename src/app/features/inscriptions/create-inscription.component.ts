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
      <h2>Nouvelle inscription</h2>

      <form (ngSubmit)="onSubmit()" class="form">
        <!-- ID doctorant géré automatiquement via le profil, plus affiché dans le formulaire -->

        <div class="row">
          <label for="nom">Nom complet</label>
          <input id="nom" name="nom" [(ngModel)]="form.nom" required class="input" />
        </div>

        <div class="row">
          <label for="cin">CIN / Carte d'identité</label>
          <input id="cin" name="cin" [(ngModel)]="form.cin" required class="input" />
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
          <label for="nationalite">Nationalité</label>
          <input id="nationalite" name="nationalite" [(ngModel)]="form.nationalite" required class="input" />
        </div>

        <div class="row">
          <label for="adresse">Adresse complète</label>
          <input id="adresse" name="adresse" [(ngModel)]="form.adresse" required class="input" />
        </div>

        <div class="row">
          <label for="situationFamiliale">Situation familiale</label>
          <input id="situationFamiliale" name="situationFamiliale" [(ngModel)]="form.situationFamiliale" required class="input" />
        </div>

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
          <label for="sujetThese">Sujet de thèse</label>
          <input id="sujetThese" name="sujetThese" [(ngModel)]="form.sujetThese" required class="input" />
        </div>

        <div class="row">
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

        <div class="row">
          <label for="anneeAcademique">Année académique (ex: 2025-2026)</label>
          <input id="anneeAcademique" name="anneeAcademique" [(ngModel)]="form.anneeAcademique" required class="input" />
        </div>

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

        <button type="submit" class="btn" [disabled]="submitting || uploading">Créer</button>
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
      background: var(--background);
    }

    .card {
      width: 100%;
      max-width: 720px;
      background: var(--card-bg);
      border-radius: 18px;
      padding: 1.75rem 2rem;
      box-shadow: var(--shadow-soft);
    }

    h2 {
      margin: 0 0 16px;
    }

    .form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .row {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    label {
      font-size: 13px;
      color: #4a5568;
      font-weight: 500;
    }

    .input {
      padding: 10px 12px;
      border: 1px solid var(--border-color);
      border-radius: 10px;
      font-size: 14px;
      background: #ffffff;
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

    .btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(15, 23, 42, 0.18);
    }

    .footer {
      margin-top: 16px;
      text-align: right;
      font-size: 0.9rem;
    }
  `]
})
export class CreateInscriptionComponent {
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
    this.service.create(this.form).subscribe({
      next: (dto) => {
        // eslint-disable-next-line no-console
        console.log('[CreateInscription] create() success', dto);
        const id = dto?.id;
        if (id && (this.diplomeFile || this.cvFile || this.lettreMotivationFile || this.cinFile)) {
          this.uploading = true;
          const files: File[] = [];
          if (this.diplomeFile) files[0] = this.diplomeFile;
          if (this.cvFile) files[1] = this.cvFile;
          if (this.lettreMotivationFile) files[2] = this.lettreMotivationFile;
          if (this.cinFile) files[3] = this.cinFile;
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
          this.submitting = false;
          alert('Inscription créée avec succès');
          // eslint-disable-next-line no-console
          console.log('[CreateInscription] navigating to /dashboard/doctorant (no files)');
          this.router.navigate(['/dashboard', 'doctorant']);
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
