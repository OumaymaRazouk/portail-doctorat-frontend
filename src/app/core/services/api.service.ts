import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  post<T>(url: string, body: unknown, options?: { headers?: HttpHeaders }) { 
    // Si l'URL commence par http, on l'utilise telle quelle
    // Sinon, on ajoute le préfixe de l'API de base
    const fullUrl = url.startsWith('http') ? url : (environment.apiBaseUrl + url);
    const opts: { headers?: HttpHeaders; observe: 'body' } = { ...(options || {}), observe: 'body' } as any;
    return this.http.post<T>(fullUrl, body, opts); 
  }

  put<T>(url: string, body: unknown, options?: { headers?: HttpHeaders }) {
    const fullUrl = url.startsWith('http') ? url : (environment.apiBaseUrl + url);
    const opts: { headers?: HttpHeaders; observe: 'body' } = { ...(options || {}), observe: 'body' } as any;
    return this.http.put<T>(fullUrl, body, opts);
  }

  delete<T>(url: string, options?: { headers?: HttpHeaders }) {
    const fullUrl = url.startsWith('http') ? url : (environment.apiBaseUrl + url);
    const opts: { headers?: HttpHeaders; observe: 'body' } = { ...(options || {}), observe: 'body' } as any;
    return this.http.delete<T>(fullUrl, opts);
  }

  get<T>(url: string, options?: { headers?: HttpHeaders }) { 
    // Si l'URL commence par http, on l'utilise telle quelle
    // Sinon, on ajoute le préfixe de l'API de base
    const fullUrl = url.startsWith('http') ? url : (environment.apiBaseUrl + url);
    const opts: { headers?: HttpHeaders; observe: 'body' } = { ...(options || {}), observe: 'body' } as any;
    return this.http.get<T>(fullUrl, opts); 
  }
}
