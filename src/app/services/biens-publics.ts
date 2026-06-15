import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface BienPublic {
  id: number;
  nom: string;
  localisation: string;
  type: string;
  statut: string;
  loyer_mensuel: number;
  chambres: number;
  bains: number;
  superficie: number;
  description?: string;
  image?: string;
  images?: string[];
  proprietaire?: number;
}

@Injectable({ providedIn: 'root' })
export class BiensPublicsService {
  private api = `${environment.apiUrl}/bien`;

  constructor(private http: HttpClient) {}

  // Biens publics : visibles même sans connexion
  getBiensPublics(): Observable<BienPublic[]> {
    return this.http.get<BienPublic[]>(this.api);
  }

  getBienPublic(id: number): Observable<BienPublic> {
    return this.http.get<BienPublic>(`${this.api}/${id}/`);
  }
}