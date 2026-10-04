import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { environment } from '../../../../environments/environment';

export interface SimpleUser {
  id: string;
  firstName?: string;
  lastName?: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private api = inject(ApiService);

  listEncadrants() {
    // Gateway path: /users/** -> utilisateurs-service /users/**
    return this.api.get<SimpleUser[]>(`${environment.endpoints.users}/encadrants`);
  }

  listDoctorants() {
    return this.api.get<SimpleUser[]>(`${environment.endpoints.users}/doctorants`);
  }

  listCandidats() {
    return this.api.get<SimpleUser[]>(`${environment.endpoints.users}/candidats`);
  }

  createDirector(payload: { firstName: string; lastName: string; email: string; etablissement?: string; specialite?: string }) {
    return this.api.post<{ success: boolean; message: string; data?: { id: number; identifiant: string; email: string; activationToken: string; activationExpiresAt: string } }>(
      `${environment.endpoints.users}/admin/directeurs`,
      payload
    );
  }
}
