// admin-dashboard.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { environment } from '../../environments/environment';

export interface AdminStats {
  totalProprietaires: number;
  totalBiens: number;
  totalLocataires: number;
  totalContrats: number;
  revenusGlobaux: number;
  demandesNonTraitees: number;
}

@Injectable({ providedIn: 'root' })
export class AdminDashboardService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getStats(): Observable<AdminStats> {
    return forkJoin({
      utilisateurs: this.http.get<any[]>(`${this.api}/utilisateurs/`).pipe(
        catchError(() => of([]))
      ),
      biens: this.http.get<any[]>(`${this.api}/bien/`).pipe(
        catchError(() => of([]))
      ),
      locataires: this.http.get<any[]>(`${this.api}/locataire/`).pipe(
        catchError(() => of([]))
      ),
      contrats: this.http.get<any[]>(`${this.api}/contrat/`).pipe(
        catchError(() => of([]))
      ),
      paiements: this.http.get<any[]>(`${this.api}/paiement/`).pipe(
        catchError(() => of([]))
      ),
      demandes: this.http.get<any[]>(`${this.api}/demandes-visite/`).pipe(
        catchError(() => of([]))
      ),
    }).pipe(
      map(data => ({
        totalProprietaires:  data.utilisateurs.filter((u: any) => u.role === 'AGENT').length,
        totalBiens:          data.biens.length,
        totalLocataires:     data.locataires.length,
        totalContrats:       data.contrats.filter((c: any) => c.statut === 'Actif').length,
        revenusGlobaux:      data.paiements
          .filter((p: any) => p.statut === 'Payé')
          .reduce((sum: number, p: any) => sum + p.montant, 0),
        demandesNonTraitees: data.demandes.filter((d: any) => !d.traite).length,
      }))
    );
  }
}