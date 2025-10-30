import { Injectable } from '@angular/core';

const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

@Injectable({ providedIn: 'root' })
export class TokenStorage {
  set(access: string, refresh?: string) {
    localStorage.setItem(ACCESS_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  }
  get access() { return localStorage.getItem(ACCESS_KEY); }
  get refresh() { return localStorage.getItem(REFRESH_KEY); }
  clear() { localStorage.removeItem(ACCESS_KEY); localStorage.removeItem(REFRESH_KEY); }
}
