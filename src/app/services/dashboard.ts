import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';


export  interface Bien {
  adresse: any;
  categorie: string;
  id: number;
  nom: string;
  localisation: string;
  type: string;
  statut: string;
  loyer_mensuel: number;
  Proprietaire?: number;

}

export interface Locataire{
  id: number;
  nom: string;
  prenom:string;
  telephone: string;
  email: string;
  bien?: number;

}

export interface Contrat{
  id: number;
  locataire: number;
  bien: number;
  loyer:number;
  statut:string;
  date_debut:string;
  date_fin:string;
}
export interface Paiement{
initiales: any;
statutClass: string|string[]|Set<string>|{ [klass: string]: any; }|null|undefined;
  id: number;
  locataire: number;
  contrat: number;
  montant: number;
  mois: string;
  statut: string;        
  date_paiement?: string;
}

export interface DashboardData {
  biens: Bien[];
  locataires: Locataire[];
  contrats: Contrat[];
  paiements: Paiement[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService{
  private api = `${environment.apiUrl}`;

  constructor(private http:HttpClient){}


  getDashboardData(): Observable<DashboardData> {
    return forkJoin({
      biens: this.http.get<Bien[]>(`${this.api}/bien/`),
      locataires: this.http.get<Locataire[]>(`${this.api}/locataire/`),
      contrats:   this.http.get<Contrat[]>(`${this.api}/contrat/`),
      paiements:  this.http.get<Paiement[]>(`${this.api}/paiement/`),
    });
  }
}
export class Dashboard {}
