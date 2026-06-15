import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { PaiementService, Paiement } from './paiement';
import { BienService, Bien } from './bien';
import { ContratService, Contrat } from './contrat';
import { LocataireService, Locataire } from './locataire';

export interface RapportData {
  revenus:         number;
  tauxOccupation:  number;
  montantImpaye:   number;
  tauxRecouvrement: number;
  biensOccupes:    number;
  biensTotal:      number;
  revenusMensuels: { label: string; encaisse: number; attendu: number }[];
  repartitionType: { type: string; montant: number }[];
  topBiens:        { nom: string; localisation: string; loyer: number; statut: string }[];
  impayes:         { nomLocataire: string; nomBien: string; montant: number; retard: string }[];
}

@Injectable({ providedIn: 'root' })
export class RapportService {

  constructor(
    private paiementService: PaiementService,
    private bienService: BienService,
    private contratService: ContratService,
    private locataireService: LocataireService,
  ) {}

  // Charge toutes les données et calcule les rapports
  getRapportData(mois: number = 6): Observable<RapportData> {
    return forkJoin({
      paiements:  this.paiementService.getPaiements(),
      biens:      this.bienService.getBiens(),
      contrats:   this.contratService.getContrats(),
      locataires: this.locataireService.getLocataires(),
    }).pipe(
      map((data: {
        paiements: Paiement[];
        biens: Bien[];
        contrats: Contrat[];
        locataires: Locataire[];
      }) => this.calculerRapport(data, mois))
    );
  }

  private calculerRapport(data: {
    paiements: Paiement[];
    biens: Bien[];
    contrats: Contrat[];
    locataires: Locataire[];
  }, mois: number): RapportData {

    const { paiements, biens, contrats, locataires } = data;

    // Maps pour jointures
    const biensMap     = new Map(biens.map((b: Bien) => [b.id, b]));
    const contratsMap  = new Map(contrats.map((c: Contrat) => [c.id, c]));
    const locatairesMap = new Map(locataires.map((l: Locataire) => [l.id, l]));

    // ── Revenus encaissés
    const payes = paiements.filter((p: Paiement) => p.statut === 'Payé');
    const revenus = payes.reduce((acc: number, p: Paiement) => acc + p.montant, 0);

    // ── Taux d'occupation
    const biensOccupes   = biens.filter((b: Bien) => b.statut === 'Occupé').length;
    const biensTotal     = biens.length;
    const tauxOccupation = biensTotal > 0
      ? Math.round((biensOccupes / biensTotal) * 100)
      : 0;

    // ── Montant impayé
    const impayes = paiements.filter((p: Paiement) => p.statut === 'Impayé');
    const montantImpaye = impayes.reduce((acc: number, p: Paiement) => acc + p.montant, 0);

    // ── Taux de recouvrement
    const totalAttendu = paiements.reduce((acc: number, p: Paiement) => acc + p.montant, 0);
    const tauxRecouvrement = totalAttendu > 0
      ? Math.round((revenus / totalAttendu) * 100)
      : 0;

    // ── Revenus mensuels (N derniers mois)
    const now = new Date();
    const revenusMensuels = [];
    for (let i = mois - 1; i >= 0; i--) {
      const d     = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleDateString('fr-FR', { month: 'short' });
      const moisStr = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

      const encaisse = paiements
        .filter((p: Paiement) => p.statut === 'Payé' && p.mois === moisStr)
        .reduce((acc: number, p: Paiement) => acc + p.montant, 0);

      // Loyers attendus = total loyers des contrats actifs
      const attendu = contrats
        .filter((c: Contrat) => c.statut === 'Actif')
        .reduce((acc: number, c: Contrat) => acc + c.loyer, 0);

      revenusMensuels.push({
        label: label.charAt(0).toUpperCase() + label.slice(1),
        encaisse,
        attendu
      });
    }

    // ── Répartition par type de bien
    const types = ['Maison', 'Appartement', 'Studio'];
    const repartitionType = types.map(type => {
      const biensDuType = biens.filter((b: Bien) => b.categorie === type);
      const montant = payes
        .filter((p: Paiement) => {
          const contrat = contratsMap.get(p.contrat);
          if (!contrat) return false;
          const bien = biensMap.get(contrat.bien);
          return bien?.categorie === type;
        })
        .reduce((acc: number, p: Paiement) => acc + p.montant, 0);
      return { type, montant };
    });

    // ── Top 5 biens par revenus
    const bienRevenus = biens.map((b: Bien) => {
      const revenu = payes
        .filter((p: Paiement) => {
          const contrat = contratsMap.get(p.contrat);
          return contrat?.bien === b.id;
        })
        .reduce((acc: number, p: Paiement) => acc + p.montant, 0);
      const contrat = contrats.find((c: Contrat) => c.bien === b.id);
      return {
        nom: b.titre,
        localisation: b.quartier_nom,
        loyer: revenu,
        statut: contrat?.statut ?? b.statut
      };
    }).sort((a, b) => b.loyer - a.loyer).slice(0, 5);

    // ── Impayés détaillés
    const impaiesDetail = impayes.map((p: Paiement) => {
      const loc     = locatairesMap.get(p.locataire);
      const contrat = contratsMap.get(p.contrat);
      const bien    = contrat ? biensMap.get(contrat.bien) : undefined;
      return {
        nomLocataire: loc ? `${loc.prenom} ${loc.nom}` : '—',
        nomBien:      bien?.titre ?? '—',
        montant:      p.montant,
        retard:       '1 mois' // Calculable plus précisément avec les dates
      };
    });

    return {
      revenus, tauxOccupation, montantImpaye, tauxRecouvrement,
      biensOccupes, biensTotal,
      revenusMensuels, repartitionType,
      topBiens: bienRevenus,
      impayes: impaiesDetail,
    };
  }
}