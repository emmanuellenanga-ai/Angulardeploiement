import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DemandeVisite {
  id?: number;
  bien: number;
  nom: string;
  telephone: string;
  email: string;
  message: string;
  date_souhaitee?: string;
  date_creation?: string;
  traite?: boolean;
}

@Injectable({ providedIn: 'root' })
export class DemandeVisiteService {
  private api = `${environment.apiUrl}/demande-visite`;

  constructor(private http: HttpClient) {}

  envoyerDemande(demande: DemandeVisite): Observable<DemandeVisite> {
    return this.http.post<DemandeVisite>(`${this.api}/`, demande);
  }
  getDemandes(): Observable<DemandeVisite[]> {
  return this.http.get<DemandeVisite[]>(`${this.api}/`);
  }

  marquerTraite(id: number): Observable<DemandeVisite> {
  return this.http.patch<DemandeVisite>(`${this.api}/${id}/`, { traite: true });
  }
}
