import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { TokenStorage } from './token-storage.service';
import { AuthResponse, LoginRequest, RegisterRequest, Role } from '../models/auth.models';
import {environment} from '../../../../environments/environment';


@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiService);
  private tokens = inject(TokenStorage);

  register(dto: { firstName: string; lastName: string; email: string; password: string; roles: string[] }) {
    return this.api.post<AuthResponse>(`${environment.endpoints.auth}/register`, dto);
  }
  login(dto: LoginRequest) {
    return this.api.post<AuthResponse>(`${environment.endpoints.auth}/login`, dto);
  }
  refresh(refreshToken: string) {
    return this.api.post<AuthResponse>(`${environment.endpoints.auth}/refresh`, { refreshToken });
  }
  me() {
    return this.api.get<{id: string; email: string; roles: Role[]; firstName?: string; lastName?: string}>(`${environment.endpoints.users}/me`);
  }

  saveTokens(res: AuthResponse) { this.tokens.set(res.accessToken, res.refreshToken); }
  logout() { this.tokens.clear(); }
  get accessToken() { return this.tokens.access; }
  get refreshToken() { return this.tokens.refresh; }

  get rolesFromJwt(): Role[] {
    const at = this.tokens.access;
    if (!at) return [];
    const payload = JSON.parse(at.split('.')[1] ? atob(at.split('.')[1]) : '{}');
    // Backend met les rôles dans claim "roles"
    return (payload['roles'] as Role[]) || [];
  }
  hasRole(role: Role) { return this.rolesFromJwt.includes(role); }
  hasAnyRole(roles: Role[]) { return roles.some(r => this.hasRole(r)); }
}
