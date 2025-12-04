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
  status?: InscriptionStatus;
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

  reject(id: string) {
    return this.api.post<InscriptionDTO>(`${this.base}/${id}/reject`, {});
  }

  uploadAttachments(id: string, files: File[]) {
    const fd = new FormData();
    if (files && files[0]) fd.append('diplome', files[0]);
    if (files && files[1]) fd.append('cv', files[1]);
    if (files && files[2]) fd.append('lettreMotivation', files[2]);
    if (files && files[3]) fd.append('cin', files[3]);
    return this.api.post<InscriptionDTO>(`${this.base}/${id}/attachments`, fd);
  }
}
