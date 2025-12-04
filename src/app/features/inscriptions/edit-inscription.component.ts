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
      <h2>Modifier ma candidature</h2>

      <form (ngSubmit)="onSubmit()" class="form" *ngIf="loaded">
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

        <button type="submit" class="btn" [disabled]="saving">Enregistrer</button>
      </form>

      <div *ngIf="!loaded">Chargement...</div>

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
    .footer { margin-top: 16px; text-align: right; }
  `]
})
export class EditInscriptionComponent {
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
