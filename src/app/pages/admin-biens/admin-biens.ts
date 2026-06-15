import { Component, OnInit } from '@angular/core';
import { NgFor, NgClass, NgIf , DecimalPipe} from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { BienService, Bien } from '../../services/bien';
import { AdminProprietaireService, ProprietaireAdmin } from '../../services/admin-proprietaire';
import { AuthService } from '../../services/auth';

interface BienRow extends Bien {
  nomProprietaire: string;
}

@Component({
  selector: 'app-admin-biens',
  standalone: true,
  imports: [RouterLink, NgFor, NgClass, NgIf, FormsModule, DecimalPipe],
  templateUrl: './admin-biens.html',
  styleUrls: ['./admin-biens.css']
})
export class AdminBiensComponent implements OnInit {

  constructor(
    private bienService: BienService,
    private propService: AdminProprietaireService,
    private authService: AuthService
  ) {}

  biensRows: BienRow[] = [];
  biensFiltres: BienRow[] = [];
  proprietaires: ProprietaireAdmin[] = [];

  loading = true;
  erreur  = '';

  recherche = '';
  filtreStatut = '';
  filtreProprietaire = '';

  pageActuelle = 1;
  parPage = 10;

  stats = { total: 0, occupes: 0, disponibles: 0, travaux: 0 };

  sidebarItems: Array<{label:string;icone:string;route:string;active:boolean;section:string;badge?:string|null}> = [
    { label:'Tableau de bord', icone:'ti ti-layout-dashboard', route:'/admin/dashboard',     active:false, section:'Administration' },
    { label:'Propriétaires',   icone:'ti ti-users',            route:'/admin/proprietaire', active:false, section:'Administration' },
    { label:'Tous les biens',  icone:'ti ti-building',         route:'/admin/biens',         active:true,  section:'Administration' },
    { label:'Demandes visite', icone:'ti ti-calendar-event',   route:'/admin/demandes',      active:false, section:'Administration' },
    { label:'Utilisateurs',    icone:'ti ti-user-cog',         route:'/admin/utilisateurs',  active:false, section:'Système' },
    { label:'Paramètres',      icone:'ti ti-settings',         route:'/parametres',          active:false, section:'Système' },
  ];

  Math = Math;

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.loading = true;
    forkJoin({
      biens:         this.bienService.getBiens(),
      proprietaires: this.propService.getProprietaires(),
    }).subscribe({
      next: (data: { biens: Bien[]; proprietaires: ProprietaireAdmin[] }) => {
        this.proprietaires = data.proprietaires.filter((p: ProprietaireAdmin) => p.role === 'PROPRIETAIRE');
        const propMap = new Map(data.proprietaires.map((p: ProprietaireAdmin) => [p.id, p]));

        this.biensRows = data.biens.map((b: Bien) => {
          const prop = propMap.get((b as any).proprietaire);
          return {
            ...b,
            nomProprietaire: prop ? `${prop.first_name} ${prop.last_name}` : '— Non assigné —'
          };
        });

        this.calculerStats();
        this.appliquerFiltres();
        this.loading = false;
      },
      error: (err: any) => {
        this.erreur  = 'Impossible de charger les biens.';
        this.loading = false;
      }
    });
  }

  calculerStats(): void {
    this.stats.total       = this.biensRows.length;
    this.stats.occupes     = this.biensRows.filter((b: BienRow) => b.statut === 'Occupé').length;
    this.stats.disponibles = this.biensRows.filter((b: BienRow) => b.statut === 'Disponible').length;
    this.stats.travaux     = this.biensRows.filter((b: BienRow) => b.statut === 'En travaux').length;
  }

  appliquerFiltres(): void {
    const q = this.recherche.toLowerCase();
    this.biensFiltres = this.biensRows.filter((b: BienRow) => {
      const matchQ = !q
        || b.titre.toLowerCase().includes(q)
        || b.quartier_nom.toLowerCase().includes(q)
        || b.nomProprietaire.toLowerCase().includes(q);
      const matchS = !this.filtreStatut || b.statut === this.filtreStatut;
      const matchP = !this.filtreProprietaire || String((b as any).proprietaire) === this.filtreProprietaire;
      return matchQ && matchS && matchP;
    });
    this.pageActuelle = 1;
  }

  get biensPagines(): BienRow[] {
    const debut = (this.pageActuelle - 1) * this.parPage;
    return this.biensFiltres.slice(debut, debut + this.parPage);
  }
  get totalPages(): number {
    return Math.ceil(this.biensFiltres.length / this.parPage);
  }
  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
  changerPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.pageActuelle = page;
  }

  getBadgeClass(statut: string): string {
    const map: Record<string,string> = {
      'Disponible': 'badge-blue',
      'Occupé':     'badge-green',
      'En travaux': 'badge-amber',
    };
    return map[statut] ?? 'badge-gray';
  }

  setActive(index: number): void {
    this.sidebarItems.forEach((item, i) => item.active = i === index);
  }

  deconnecter(): void {
    this.authService.logout();
  }
}