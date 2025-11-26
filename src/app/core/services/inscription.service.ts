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
    for (const f of (files || [])) {
      fd.append('files', f);
    }
    return this.api.post<InscriptionDTO>(`${this.base}/${id}/attachments`, fd);
  }
}
