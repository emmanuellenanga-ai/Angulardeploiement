import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Paiement {
  id?: number;
  reference?: string;
  locataire: number;
  contrat: number;
  montant: number;
  mois: string;
  date_paiement?: string;
  mode_paiement?: string;  // 'Espèces' | 'Virement' | 'Mobile Money' | 'Chèque'
  statut: string;          // 'Payé' | 'En attente' | 'Impayé'
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class PaiementService {

  private api = `${environment.apiUrl}/paiement/`;

  constructor(private http: HttpClient) {}

  getPaiements(): Observable<Paiement[]> {
    return this.http.get<Paiement[]>(this.api);
  }

  getPaiement(id: number): Observable<Paiement> {
    return this.http.get<Paiement>(`${this.api}/${id}/`);
  }

  enregistrerPaiement(p: Paiement): Observable<Paiement> {
    return this.http.post<Paiement>(`${this.api}/`, p);
  }

  modifierPaiement(id: number, p: Paiement): Observable<Paiement> {
    return this.http.put<Paiement>(`${this.api}/${id}/`, p);
  }

  supprimerPaiement(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}/`);
  }

  telechargerRecu(id: number): Observable<Blob> {
    return this.http.get(`${this.api}/${id}/recu/`, { responseType: 'blob' });
  }
}