import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ProprietaireAdmin {
  id?: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  telephone?: string;
  role: 'ADMIN' | 'PROPRIETAIRE';
  is_active: boolean;
  password?: string; // utilisé seulement à la création
}

@Injectable({ providedIn: 'root' })
export class AdminProprietaireService {
  private api = `${environment.apiUrl}/utilisateurs`;

  constructor(private http: HttpClient) {}

  getProprietaires(): Observable<ProprietaireAdmin[]> {
    return this.http.get<ProprietaireAdmin[]>(`${this.api}/`);
  }

  creerProprietaire(p: ProprietaireAdmin): Observable<ProprietaireAdmin> {
    return this.http.post<ProprietaireAdmin>(`${this.api}/`, { ...p, role: 'PROPRIETAIRE' });
  }

  modifierProprietaire(id: number, p: ProprietaireAdmin): Observable<ProprietaireAdmin> {
    return this.http.put<ProprietaireAdmin>(`${this.api}/${id}/`, p);
  }

  toggleActif(id: number, actif: boolean): Observable<ProprietaireAdmin> {
    return this.http.patch<ProprietaireAdmin>(`${this.api}/${id}/`, { is_active: actif });
  }

  supprimerProprietaire(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}/`);
  }
}