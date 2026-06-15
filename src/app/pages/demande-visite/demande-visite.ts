import { Component, OnInit } from '@angular/core';
import { NgFor, NgClass, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { DemandeVisiteService, DemandeVisite } from '../../services/demande-visite';
import { BienService, Bien } from '../../services/bien';
import { AuthService } from '../../services/auth';

interface DemandeRow {
  id: number;
  nomBien: string;
  nomDemandeur: string;
  telephone: string;
  email: string;
  message: string;
  dateSouhaitee: string;
  dateCreation: string;
  traite: boolean;
}

@Component({
  selector: 'app-demandes-visite',
  standalone: true,
  imports: [RouterLink, NgFor, NgClass, NgIf],
  templateUrl: './demande-visite.html',
  styleUrls: ['./demande-visite.css']
})
export class DemandeVisiteComponent implements OnInit {

  constructor(
    private demandeService: DemandeVisiteService,
    private bienService: BienService,
    private authService: AuthService
  ) {}

  demandesRows: DemandeRow[] = [];
  loading = true;
  erreur  = '';

  filtreStatut = ''; // '' | 'nouvelles' | 'traitees'

  sidebarItems: Array<{label:string;icone:string;route:string;active:boolean;section:string;badge?:string|null}> = [
    { label:'Tableau de bord', icone:'ti ti-layout-dashboard', route:'/dashboard',       active:false, section:'Principal' },
    { label:'Biens',           icone:'ti ti-building',         route:'/bien',            active:false, section:'Principal' },
    { label:'Locataires',      icone:'ti ti-users',            route:'/locataire',       active:false, section:'Principal' },
    { label:'Contrats',        icone:'ti ti-file-text',        route:'/contrat',         active:false, section:'Principal' },
    { label:'Paiements',       icone:'ti ti-credit-card',      route:'/paiement',        active:false, section:'Principal' },
    { label:'Demandes visite', icone:'ti ti-calendar-event',   route:'/demandes-visite', active:true,  section:'Principal', badge: null },
    { label:'Rapports',        icone:'ti ti-chart-bar',        route:'/rapport',         active:false, section:'Analyse'   },
    { label:'Paramètres',      icone:'ti ti-settings',         route:'/parametres',      active:false, section:'Système'   },
  ];

  ngOnInit(): void {
    this.chargerDemandes();
  }

  chargerDemandes(): void {
    this.loading = true;
    forkJoin({
      demandes: this.demandeService.getDemandes(),
      biens:    this.bienService.getBiens()
    }).subscribe({
      next: (data: { demandes: DemandeVisite[]; biens: Bien[] }) => {
        const biensMap = new Map(data.biens.map((b: Bien) => [b.id, b]));

        this.demandesRows = data.demandes.map((d: DemandeVisite) => ({
          id:            d.id ?? 0,
          nomBien:       biensMap.get(d.bien)?.titre ?? '—',
          nomDemandeur:  d.nom,
          telephone:     d.telephone,
          email:         d.email,
          message:       d.message,
          dateSouhaitee: d.date_souhaitee
            ? new Date(d.date_souhaitee).toLocaleDateString('fr-FR')
            : '—',
          dateCreation:  d.date_creation
            ? new Date(d.date_creation).toLocaleDateString('fr-FR')
            : '—',
          traite:        d.traite ?? false,
        }));

        // Met à jour le badge sidebar avec le nombre de demandes non traitées
        const nonTraitees = this.demandesRows.filter(d => !d.traite).length;
        const item = this.sidebarItems.find(i => i.label === 'Demandes visite');
        if (item) item.badge = nonTraitees > 0 ? String(nonTraitees) : null;

        this.loading = false;
      },
      error: (err: any) => {
        this.erreur  = 'Impossible de charger les demandes.';
        this.loading = false;
      }
    });
  }

  get demandesFiltrees(): DemandeRow[] {
    if (this.filtreStatut === 'nouvelles') return this.demandesRows.filter(d => !d.traite);
    if (this.filtreStatut === 'traitees')  return this.demandesRows.filter(d => d.traite);
    return this.demandesRows;
  }

  marquerTraite(id: number): void {
    this.demandeService.marquerTraite(id).subscribe({
      next: () => this.chargerDemandes(),
      error: () => this.erreur = 'Erreur lors de la mise à jour.'
    });
  }

  setActive(index: number): void {
    this.sidebarItems.forEach((item, i) => item.active = i === index);
  }
}