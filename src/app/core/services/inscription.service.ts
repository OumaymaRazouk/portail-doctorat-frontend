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
  status?: string;
}

@Injectable({ providedIn: 'root' })
export class InscriptionService {
  private api = inject(ApiService);
  private base = environment.endpoints.inscriptions; // '/inscription'

  create(dto: CreateInscriptionRequest) {
    // Utilisation directe de l'URL complète du service d'inscription
    return this.api.post<InscriptionDTO>(environment.endpoints.inscriptions, dto);
  }
}
