import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface HomeStats {
  biensDisponibles: number;
  biensOccupes:     number;
  contratsActifs:   number;
  loyersEncaisses:  number;
  locataires:       number;
}

export interface BienVedette {
  id:           number;
  nom:          string;
  localisation: string;
  chambres:     number;
  bains:        number;
  superficie:   number;
  loyer_mensuel: number;
  statut:       string;
  type:         string;
  image?:       string;
  favori:       boolean;
}

@Injectable({ providedIn: 'root' })
export class HomeService {

  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ── Stats pour la home ──
  getStats(): Observable<HomeStats> {
    return forkJoin({
      biens:      this.http.get<any[]>(`${this.api}/bien/`),
      contrats:   this.http.get<any[]>(`${this.api}/contrat/`),
      paiements:  this.http.get<any[]>(`${this.api}/paiement/`),
      locataires: this.http.get<any[]>(`${this.api}/locataire/`),
    }).pipe(
      map(data => ({
        biensDisponibles: data.biens.filter(b => b.statut === 'Disponible').length,
        biensOccupes:     data.biens.filter(b => b.statut === 'Occupé').length,
        contratsActifs:   data.contrats.filter(c => c.statut === 'Actif').length,
        loyersEncaisses:  data.paiements
          .filter(p => p.statut === 'Payé')
          .reduce((acc: number, p: any) => acc + p.montant, 0),
        locataires:       data.locataires.length,
      }))
    );
  }

  // ── Biens en vedette (4 premiers biens disponibles) ──
  getBiensVedette(): Observable<BienVedette[]> {
    return this.http.get<any[]>(`${this.api}/bien/`).pipe(
      map(biens =>
        biens
          .filter(b => b.statut === 'Disponible' || b.statut === 'Occupé')
          .slice(0, 4)
          .map(b => ({ ...b, favori: false }))
      )
    );
  }
}