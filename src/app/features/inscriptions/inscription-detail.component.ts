import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LayoutComponent } from '../components/layout.component';
import { InscriptionDTO, InscriptionService } from '../../core/services/inscription.service';

@Component({
  selector: 'app-inscription-detail',
  standalone: true,
  imports: [LayoutComponent, CommonModule, RouterLink],
  template: `
    <app-layout title="Détail du dossier">
      <div class="card" *ngIf="loading">Chargement...</div>
      <div class="card error" *ngIf="!loading && error">{{ error }}</div>

      <div class="card" *ngIf="!loading && !error && inscription">
        <div class="header">
          <h2>Dossier {{ inscription.type || 'INSCRIPTION' }}</h2>
          <button class="btn secondary" type="button" (click)="goBack()">Retour</button>
        </div>

        <div class="section">
          <h3>Informations générales</h3>
          <div class="grid">
            <div><span class="label">Identifiant dossier</span><span class="value">{{ inscription.id }}</span></div>
            <div><span class="label">Type</span><span class="value">{{ inscription.type || 'INSCRIPTION' }}</span></div>
            <div><span class="label">Année académique</span><span class="value">{{ inscription.anneeAcademique }}</span></div>
            <div><span class="label">Statut</span><span class="value">{{ inscription.status }}</span></div>
            <div><span class="label">Motif de rejet</span><span class="value">{{ inscription.motifRejet || '-' }}</span></div>
            <div><span class="label">Date de demande</span><span class="value">{{ inscription.dateDemande || '-' }}</span></div>
          </div>
        </div>

        <div class="section actions-docs" *ngIf="inscription.id">
          <h3>Documents PDF</h3>
          <div class="actions-row">
            <button
              class="btn secondary"
              type="button"
              *ngIf="inscription.status && inscription.status !== 'BROUILLON'"
              (click)="downloadAccuseReception()">
              Accusé de réception
            </button>

            <button
              class="btn secondary"
              type="button"
              *ngIf="inscription.status === 'VALIDE' && (!inscription.type || inscription.type === 'INSCRIPTION')"
              (click)="downloadAttestationInitiale()">
              Attestation d'inscription initiale
            </button>

            <button
              class="btn secondary"
              type="button"
              *ngIf="inscription.status === 'VALIDE' && inscription.type === 'REINSCRIPTION'"
              (click)="downloadAttestationReinscription()">
              Attestation de réinscription
            </button>

            <button
              class="btn secondary"
              type="button"
              *ngIf="inscription.status === 'VALIDE' || inscription.status === 'REJETE'"
              (click)="downloadReponseDecision()">
              Réponse de décision
            </button>
          </div>
        </div>

        <div class="section">
          <h3>Informations personnelles</h3>
          <div class="grid">
            <div><span class="label">Nom complet</span><span class="value">{{ inscription.nom }}</span></div>
            <div><span class="label">CIN</span><span class="value">{{ inscription.cin }}</span></div>
            <div><span class="label">CNE</span><span class="value">{{ inscription.cne }}</span></div>
            <div><span class="label">Téléphone</span><span class="value">{{ inscription.telephone }}</span></div>
            <div><span class="label">Email</span><span class="value">{{ inscription.emailContact }}</span></div>
            <div><span class="label">Date de naissance</span><span class="value">{{ inscription.dateNaissance }}</span></div>
            <div><span class="label">Lieu de naissance</span><span class="value">{{ inscription.lieuNaissance }}</span></div>
            <div><span class="label">Nationalité</span><span class="value">{{ inscription.nationalite }}</span></div>
            <div><span class="label">Adresse</span><span class="value">{{ inscription.adresse }}</span></div>
            <div><span class="label">Situation familiale</span><span class="value">{{ inscription.situationFamiliale }}</span></div>
          </div>
        </div>

        <div class="section">
          <h3>Informations de thèse</h3>
          <div class="grid">
            <div><span class="label">Sujet de thèse</span><span class="value">{{ inscription.sujetThese }}</span></div>
            <div><span class="label">Résumé</span><span class="value">{{ inscription.resumeThese }}</span></div>
            <div><span class="label">Laboratoire</span><span class="value">{{ inscription.laboratoire }}</span></div>
            <div><span class="label">Spécialité</span><span class="value">{{ inscription.specialite }}</span></div>
            <div><span class="label">Directeur (ID)</span><span class="value">{{ inscription.directeurId }}</span></div>
            <div><span class="label">Co-directeur (ID)</span><span class="value">{{ inscription.coDirecteurId || '-' }}</span></div>
          </div>
        </div>

        <div class="section" *ngIf="inscription.rapportAvancement || inscription.publicationsN1 || inscription.communicationsN1 || inscription.heuresFormationCumulees">
          <h3>Réinscription / Avancement</h3>
          <div class="grid">
            <div class="col-2"><span class="label">Résumé du rapport d'avancement</span><span class="value">{{ inscription.rapportAvancement }}</span></div>
            <div class="col-2"><span class="label">Publications N-1</span><span class="value">{{ inscription.publicationsN1 }}</span></div>
            <div class="col-2"><span class="label">Communications N-1</span><span class="value">{{ inscription.communicationsN1 }}</span></div>
            <div><span class="label">Heures de formation cumulées</span><span class="value">{{ inscription.heuresFormationCumulees }}</span></div>
          </div>
        </div>

        <div class="section">
          <h3>Pièces jointes</h3>
          <div *ngIf="attachmentsLoading">Chargement des pièces...</div>
          <div *ngIf="!attachmentsLoading && attachmentsError" class="error">{{ attachmentsError }}</div>
          <div *ngIf="!attachmentsLoading && !attachmentsError && attachments.length === 0">Aucune pièce jointe trouvée.</div>
          <ul *ngIf="!attachmentsLoading && !attachmentsError && attachments.length > 0" class="attachments">
            <li *ngFor="let f of attachments">
              <a class="link" href="#" (click)="openAttachment(f, $event)">{{ f }}</a>
            </li>
          </ul>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .card {
      background: var(--card-bg);
      border-radius: 16px;
      padding: 1.5rem 1.75rem;
      box-shadow: var(--shadow-soft);
      margin-bottom: 1.25rem;
    }
    .card.error { border:1px solid #fecaca; color:#991b1b; background:#fef2f2; }
    .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; }
    .section { margin-top:12px; }
    .section h3 { margin:0 0 8px; font-size:15px; }
    .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:8px 16px; }
    .col-2 { grid-column:span 2; }
    .label { display:block; font-size:12px; color:#6b7280; margin-bottom:2px; }
    .value { font-size:14px; color:#111827; word-break:break-word; }
    .btn {
      background: var(--primary);
      color: var(--primary-foreground);
      border-radius: 999px;
      border:0;
      padding:6px 14px;
      cursor:pointer;
      font-size:13px;
      font-weight: 500;
      transition: background-color 0.15s ease, transform 0.1s ease, box-shadow 0.15s ease;
    }
    .btn.secondary { background: var(--info); }
    .btn.secondary:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(15, 23, 42, 0.18);
    }
    .actions-docs .actions-row { display:flex; flex-wrap:wrap; gap:8px; }
    .attachments { list-style:none; padding-left:0; margin:0; display:flex; flex-direction:column; gap:4px; }
    .attachments .link { background:none; border:0; padding:0; color:#2563eb; text-decoration:underline; font-size:14px; cursor:pointer; text-align:left; }
  `]
})
export class InscriptionDetailComponent {
  inscription?: InscriptionDTO;
  loading = false;
  error = '';

  attachments: string[] = [];
  attachmentsLoading = false;
  attachmentsError = '';

  private inscriptionId = '';

  constructor(
    private route: ActivatedRoute,
    private service: InscriptionService,
    private location: Location
  ) {
    this.load();
  }

  private load() {
    this.loading = true;
    this.error = '';
    this.inscriptionId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.inscriptionId) {
      this.loading = false;
      this.error = "Identifiant de dossier manquant";
      return;
    }
    this.service.getById(this.inscriptionId).subscribe({
      next: dto => {
        this.inscription = dto;
        this.loading = false;
        this.loadAttachments();
      },
      error: e => {
        this.loading = false;
        this.error = e?.error?.message || 'Erreur lors du chargement du dossier';
      }
    });
  }

  private loadAttachments() {
    this.attachmentsLoading = true;
    this.attachmentsError = '';
    this.service.listAttachments(this.inscriptionId).subscribe({
      next: (list: string[]) => {
        this.attachments = list || [];
        this.attachmentsLoading = false;
      },
      error: (e: any) => {
        this.attachmentsLoading = false;
        this.attachmentsError = e?.error?.message || 'Erreur lors du chargement des pièces jointes';
      }
    });
  }

  goBack() {
    this.location.back();
  }

  openAttachment(fileName: string, event: MouseEvent) {
    event.preventDefault();
    const id = this.inscription?.id;
    if (!id) {
      return;
    }
    const payload = encodeURIComponent(JSON.stringify({ id, fileName }));
    const url = `${window.location.origin}/?viewer=${payload}`;
    window.open(url, '_blank', 'noopener');
  }

  private openBlobInNewTab(blob: Blob, fileName: string) {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.target = '_blank';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  downloadAccuseReception() {
    const id = this.inscription?.id;
    if (!id) return;
    this.service.downloadAccuseReception(id).subscribe(blob => {
      this.openBlobInNewTab(blob, `accuse-reception-${id}.pdf`);
    });
  }

  downloadAttestationInitiale() {
    const id = this.inscription?.id;
    if (!id) return;
    this.service.downloadAttestationInitiale(id).subscribe(blob => {
      this.openBlobInNewTab(blob, `attestation-inscription-${id}.pdf`);
    });
  }

  downloadAttestationReinscription() {
    const id = this.inscription?.id;
    if (!id) return;
    this.service.downloadAttestationReinscription(id).subscribe(blob => {
      this.openBlobInNewTab(blob, `attestation-reinscription-${id}.pdf`);
    });
  }

  downloadReponseDecision() {
    const id = this.inscription?.id;
    if (!id) return;
    this.service.downloadReponseDecision(id).subscribe(blob => {
      this.openBlobInNewTab(blob, `reponse-decision-${id}.pdf`);
    });
  }
}
