import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import { environment } from '../../environments/environment';

export interface Locataire{
  id?: number;
  nom: string;
  prenom: string;
  telephone: string;
  numero_cni: string;
  email: string;
  adresse: string;
  profession?: string;
  date_naissance?: string;
  bien?: number;
  statut: string;
  date_entree: string;
  observations?: string;

}
@Injectable({
  providedIn: 'root',
})
export class LocataireService {
  private api = `${environment.apiUrl}/locataire/`;

  constructor( private http: HttpClient) {}

  getLocataires():Observable<Locataire[]>{
    return this.http.get<Locataire[]>(this.api);

  }
  getLocataire(id:number):Observable<Locataire[]>{
    return this.http.get<Locataire[]>(`${this.api}/${id}/`);

  }
  creerLocataire(loc:Locataire):Observable<Locataire>{
    return this.http.post<Locataire>('${this.api}/', loc);
  }
  modifierLocataire(id: number, loc: Locataire): Observable<Locataire> {
    return this.http.put<Locataire>(`${this.api}/${id}/`, loc);
  }

  supprimerLocataire(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}/`);
  }
}
