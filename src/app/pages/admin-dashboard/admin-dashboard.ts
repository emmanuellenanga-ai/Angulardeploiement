import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { AdminDashboardService, AdminStats } from '../../services/admin-dashboard';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink, NgFor, NgIf, NgClass],
  templateUrl: './admin-dashboard.html',
  styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private statsService: AdminDashboardService,
    private authService: AuthService,
    private router: Router
  ) {}

  loading = true;
  erreur  = '';

  stats: AdminStats = {
    totalProprietaires: 0,
    totalBiens: 0,
    totalLocataires: 0,
    totalContrats: 0,
    revenusGlobaux: 0,
    demandesNonTraitees: 0,
  };

  get revenusFormates(): string {
    const r = this.stats.revenusGlobaux;
    return r >= 1000000 ? (r / 1000000).toFixed(1) + 'M' : r.toLocaleString('fr-FR');
  }

  sidebarItems: Array<{label:string;icone:string;route:string;active:boolean;section:string;badge?:string|null}> = [
    { label:'Tableau de bord', icone:'ti ti-layout-dashboard', route:'/admin/dashboard',     active:true,  section:'Administration', badge: null },
    { label:'Propriétaires',   icone:'ti ti-users',            route:'/admin/proprietaire', active:true, section:'Administration' },
    { label:'Tous les biens',  icone:'ti ti-building',         route:'/admin/biens',         active:false, section:'Administration' },
    { label:'Demandes visite', icone:'ti ti-calendar-event',   route:'/admin/demandes',      active:false, section:'Administration', badge: null },
    { label:'Utilisateurs',    icone:'ti ti-user-cog',         route:'/admin/utilisateurs',  active:false, section:'Système' },
    { label:'Paramètres',      icone:'ti ti-settings',         route:'/parametres',          active:false, section:'Système' },
  ];

  ngOnInit(): void {
    this.chargerStats();
  }

  chargerStats(): void {
    this.loading = true;
    this.statsService.getStats().subscribe({
      next: (data: AdminStats) => {
        this.stats   = data;
        this.loading = false;

        const item = this.sidebarItems.find(i => i.label === 'Demandes visite');
        if (item) item.badge = data.demandesNonTraitees > 0 ? String(data.demandesNonTraitees) : null;
      },
      error: (err: any) => {
        this.erreur  = 'Impossible de charger les statistiques.';
        this.loading = false;
      }
    });
  }

  setActive(index: number): void {
    this.sidebarItems.forEach((item, i) => item.active = i === index);
  }

  deconnecter(): void {
    this.authService.logout();
  }
}