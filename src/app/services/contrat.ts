import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Contrat {
  id?: number;
  reference?: string;
  locataire: number;
  bien: number;
  loyer: number;
  date_debut: string;
  date_fin: string;
  statut: string;      // 'Actif' | 'Expiration' | 'Résilié'
  observations?: string;
}

@Injectable({ providedIn: 'root' })
export class ContratService {

  private api = `${environment.apiUrl}/contrat/`;

  constructor(private http: HttpClient) {}

  getContrats(): Observable<Contrat[]> {
    return this.http.get<Contrat[]>(this.api);
  }

  getContrat(id: number): Observable<Contrat> {
    return this.http.get<Contrat>(`${this.api}/${id}/`);
  }

  creerContrat(contrat: Contrat): Observable<Contrat> {
    return this.http.post<Contrat>(`${this.api}/`, contrat);
  }

  modifierContrat(id: number, contrat: Contrat): Observable<Contrat> {
    return this.http.put<Contrat>(`${this.api}/${id}/`, contrat);
  }

  resilierContrat(id: number): Observable<Contrat> {
    return this.http.patch<Contrat>(`${this.api}/${id}/`, { statut: 'Résilié' });
  }

  supprimerContrat(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}/`);
  }
}