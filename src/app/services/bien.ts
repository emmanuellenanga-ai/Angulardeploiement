import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Bien {
  id?: number;
  titre: string;
  quartier_nom: string;
  categorie: string;           // 'Maison' | 'Appartement' | 'Studio'
  statut: string;         // 'Disponible' | 'Occupé' | 'En travaux'
  loyer_mensuel: number;
  nombre_chambre: number;
  surface: number;
  description?: string;
  proprietaire_nom?: number;
  image?: string;
}

@Injectable({ providedIn: 'root' })
export class BienService {

  private api = `${environment.apiUrl}/bien`;

  constructor(private http: HttpClient) {}

  getBiens(): Observable<Bien[]> {
    return this.http.get<Bien[]>(this.api);
  }

  getBien(id: number): Observable<Bien> {
    return this.http.get<Bien>(`${this.api}/${id}/`);
  }

  creerBien(bien: Bien): Observable<Bien> {
    return this.http.post<Bien>(`${this.api}/`, bien);
  }

  modifierBien(id: number, bien: Bien): Observable<Bien> {
    return this.http.put<Bien>(`${this.api}/${id}/`, bien);
  }

  supprimerBien(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}/`);
  }
}