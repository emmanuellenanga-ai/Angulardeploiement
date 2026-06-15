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
  selector: 'app-admin-demandes',
  standalone: true,
  imports: [RouterLink, NgFor, NgClass, NgIf],
  templateUrl: './admin-demandes.html',
  styleUrls: ['./admin-demandes.css']
})
export class AdminDemandesComponent implements OnInit {

  constructor(
    private demandeService: DemandeVisiteService,
    private bienService: BienService,
    private authService: AuthService
  ) {}

  demandesRows: DemandeRow[] = [];
  loading = true;
  erreur  = '';
  filtreStatut = '';

  sidebarItems: Array<{label:string;icone:string;route:string;active:boolean;section:string;badge?:string|null}> = [
    { label:'Tableau de bord', icone:'ti ti-layout-dashboard', route:'/admin/dashboard',     active:false, section:'Administration' },
    { label:'Propriétaires',   icone:'ti ti-users',            route:'/admin/proprietaires', active:false, section:'Administration' },
    { label:'Tous les biens',  icone:'ti ti-building',         route:'/admin/biens',         active:false, section:'Administration' },
    { label:'Demandes visite', icone:'ti ti-calendar-event',   route:'/admin/demandes',      active:true,  section:'Administration', badge: null },
    { label:'Utilisateurs',    icone:'ti ti-user-cog',         route:'/admin/utilisateurs',  active:false, section:'Système' },
    { label:'Paramètres',      icone:'ti ti-settings',         route:'/parametres',          active:false, section:'Système' },
  ];

  ngOnInit(): void { this.charger(); }

  charger(): void {
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
            ? new Date(d.date_souhaitee).toLocaleDateString('fr-FR') : '—',
          dateCreation:  d.date_creation
            ? new Date(d.date_creation).toLocaleDateString('fr-FR') : '—',
          traite:        d.traite ?? false,
        }));

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
      next: () => this.charger(),
      error: () => this.erreur = 'Erreur lors de la mise à jour.'
    });
  }

  setActive(index: number): void {
    this.sidebarItems.forEach((item, i) => item.active = i === index);
  }

  deconnecter(): void {
    this.authService.logout();
  }
}
