import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  post<T>(url: string, body: unknown) { 
    // Si l'URL commence par http, on l'utilise telle quelle
    // Sinon, on ajoute le préfixe de l'API de base
    const fullUrl = url.startsWith('http') ? url : (environment.apiBaseUrl + url);
    return this.http.post<T>(fullUrl, body); 
  }
  
  get<T>(url: string) { 
    // Si l'URL commence par http, on l'utilise telle quelle
    // Sinon, on ajoute le préfixe de l'API de base
    const fullUrl = url.startsWith('http') ? url : (environment.apiBaseUrl + url);
    return this.http.get<T>(fullUrl); 
  }
}
