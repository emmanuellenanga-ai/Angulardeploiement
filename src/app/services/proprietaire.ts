import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Proprietaire {
  id?: number;
  nom: string;
  prenom: string;
  telephone: string;
  email: string;
  adresse?: string;
  profession?: string;
  statut: string;    // 'Actif' | 'Inactif'
  observations?: string;
}

@Injectable({ providedIn: 'root' })
export class ProprietaireService {
  private api = `${environment.apiUrl}/proprietaire/`;
  constructor(private http: HttpClient) {}

  getProprietaires(): Observable<Proprietaire[]> {
    return this.http.get<Proprietaire[]>(this.api);
  }
  getProprietaire(id: number): Observable<Proprietaire> {
    return this.http.get<Proprietaire>(`${this.api}/${id}/`);
  }
  creerProprietaire(p: Proprietaire): Observable<Proprietaire> {
    return this.http.post<Proprietaire>(`${this.api}/`, p);
  }
  modifierProprietaire(id: number, p: Proprietaire): Observable<Proprietaire> {
    return this.http.put<Proprietaire>(`${this.api}/${id}/`, p);
  }
  supprimerProprietaire(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}/`);
  }
}