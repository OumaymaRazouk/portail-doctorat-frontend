import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { environment } from '../../../../environments/environment';

export interface CreateInscriptionRequest {
  doctorantId: string;
  directeurId: string;
  coDirecteurId?: string;
  sujetThese: string;
  laboratoire: string;
  specialite: string;
  anneeAcademique: string; // ex: 2025-2026

  nom: string;
  cin: string;
  telephone: string;
  emailContact: string;
  cne: string;
  dateNaissance: string;
  lieuNaissance: string;
  nationalite: string;
  adresse: string;
  situationFamiliale: string;
  resumeThese: string;
  rapportAvancement?: string;
  publicationsN1?: string;
  communicationsN1?: string;
  heuresFormationCumulees?: string;
}

export interface InscriptionDTO {
  id?: string;
  doctorantId: string;
  directeurId: string;
  coDirecteurId?: string;
  sujetThese: string;
  laboratoire: string;
  specialite: string;
  anneeAcademique: string;
  type?: 'INSCRIPTION' | 'REINSCRIPTION';
  nom?: string;
  cin?: string;
  telephone?: string;
  emailContact?: string;
  cne?: string;
  dateNaissance?: string;
  lieuNaissance?: string;
  nationalite?: string;
  adresse?: string;
  situationFamiliale?: string;
  resumeThese?: string;
  rapportAvancement?: string;
  publicationsN1?: string;
  communicationsN1?: string;
  heuresFormationCumulees?: string;
  motifRejet?: string;
  status?: InscriptionStatus;
  dateDemande?: string;
}

export type InscriptionStatus = 'BROUILLON' | 'EN_ATTENTE_ADMIN' | 'EN_ATTENTE_DIRECTEUR' | 'VALIDE' | 'REJETE';

@Injectable({ providedIn: 'root' })
export class InscriptionService {
  private api = inject(ApiService);
  private base = environment.endpoints.inscriptions; // '/inscription'

  create(dto: CreateInscriptionRequest) {
    // Utilisation directe de l'URL complète du service d'inscription
    return this.api.post<InscriptionDTO>(environment.endpoints.inscriptions, dto);
  }

  createReinscription(dto: CreateInscriptionRequest) {
    return this.api.post<InscriptionDTO>(`${this.base}/reinscriptions`, dto);
  }

  prefill(doctorantId: string, annee: string) {
    return this.api.post<InscriptionDTO>(`${this.base}/reinscriptions/prefill?doctorantId=${encodeURIComponent(doctorantId)}&annee=${encodeURIComponent(annee)}`, {});
  }

  getById(id: string) {
    return this.api.get<InscriptionDTO>(`${this.base}/${id}`);
  }

  listByDoctorant(doctorantId: string) {
    return this.api.get<InscriptionDTO[]>(`${this.base}/doctorants/${doctorantId}`);
  }

  listByDirecteur(directeurId: string) {
    return this.api.get<InscriptionDTO[]>(`${this.base}/directeurs/${directeurId}`);
  }

  listPendingForAdmin() {
    return this.api.get<InscriptionDTO[]>(`${this.base}/admin/en-attente`);
  }

  submit(id: string) {
    return this.api.post<InscriptionDTO>(`${this.base}/${id}/submit`, {});
  }

  update(id: string, dto: CreateInscriptionRequest) {
    return this.api.put<InscriptionDTO>(`${this.base}/${id}`, dto);
  }

  delete(id: string) {
    return this.api.delete<void>(`${this.base}/${id}`);
  }

  directorApprove(id: string) {
    return this.api.post<InscriptionDTO>(`${this.base}/${id}/director-approve`, {});
  }

  adminApprove(id: string) {
    return this.api.post<InscriptionDTO>(`${this.base}/${id}/admin-approve`, {});
  }

  reject(id: string, motif?: string) {
    const url = motif
      ? `${this.base}/${id}/reject?motif=${encodeURIComponent(motif)}`
      : `${this.base}/${id}/reject`;
    return this.api.post<InscriptionDTO>(url, {});
  }

  uploadAttachments(id: string, files: File[]) {
    const fd = new FormData();
    if (files && files[0]) fd.append('diplome', files[0]);
    if (files && files[1]) fd.append('cv', files[1]);
    if (files && files[2]) fd.append('lettreMotivation', files[2]);
    if (files && files[3]) fd.append('cin', files[3]);
    return this.api.post<InscriptionDTO>(`${this.base}/${id}/attachments`, fd);
  }

  listAttachments(id: string) {
    return this.api.get<string[]>(`${this.base}/${id}/attachments`);
  }

  buildAttachmentUrl(id: string, fileName: string) {
    return `${this.base}/${id}/attachments/${encodeURIComponent(fileName)}`;
  }
}
