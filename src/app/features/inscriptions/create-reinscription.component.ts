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
        <div class="row">
          <label for="doctorantId">ID Doctorant</label>
          <input id="doctorantId" name="doctorantId" [(ngModel)]="form.doctorantId" required class="input" [readonly]="true" />
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
          <label>Pièces jointes du dossier (PDF, images)</label>
          <input type="file" multiple accept=".pdf,image/*" (change)="onFilesSelected($event)" />
          <small *ngIf="selectedFiles.length > 0">{{ selectedFiles.length }} fichier(s) sélectionné(s)</small>
        </div>

        <div class="row" style="display:flex; gap:8px; align-items:center;">
          <button type="submit" class="btn" [disabled]="submitting || uploading">Créer</button>
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
    anneeAcademique: ''
  };
  selectedFiles: File[] = [];
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
    this.service.createReinscription(this.form).subscribe({
      next: (dto) => {
        const id = dto?.id;
        if (id && this.selectedFiles.length > 0) {
          this.uploading = true;
          this.service.uploadAttachments(id, this.selectedFiles).subscribe({
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
          alert('Réinscription créée avec succès');
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
    if (!this.isValidAcademicYear(nextYear)) {
      alert("Format d'année académique invalide. Utilisez AAAA-AAAA (ex: 2025-2026).");
      return;
    }
    if (!this.form.doctorantId) return;
    this.service.prefill(this.form.doctorantId, nextYear).subscribe({
      next: (dto) => {
        this.form = {
          doctorantId: dto.doctorantId,
          directeurId: dto.directeurId,
          coDirecteurId: dto.coDirecteurId,
          sujetThese: dto.sujetThese,
          laboratoire: dto.laboratoire,
          specialite: dto.specialite,
          anneeAcademique: nextYear
        };
      },
      error: (err) => {
        console.error(err);
        alert('Pré-remplissage impossible');
      }
    })
  }

  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const files = input.files ? Array.from(input.files) : [];
    this.selectedFiles = files;
  }
}
