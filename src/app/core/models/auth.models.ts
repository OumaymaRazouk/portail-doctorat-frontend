export type Role = 'DOCTORANT' | 'ADMIN' | 'SUPER_ADMIN' | 'ENCADRANT';

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  tokenType?: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  roles?: Role[]; // ex: ["ADMIN"]
}

export interface LoginRequest {
  email: string;
  password: string;
}
