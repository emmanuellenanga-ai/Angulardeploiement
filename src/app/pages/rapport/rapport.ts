import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { isPlatformBrowser, NgFor, NgClass, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RapportService, RapportData } from '../../services/rapport';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-rapport',
  standalone: true,
  imports: [RouterLink, NgFor, NgClass, NgIf],
  templateUrl: './rapport.html',
  styleUrls: ['./rapport.css']
})
export class RapportComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private rapportService: RapportService,
    private authService:AuthService
  ) {}

  private destroy$ = new Subject<void>();
  private chartRev: any = null;
  private chartRep: any = null;

  loading  = true;
  erreur   = '';
  rapport: RapportData | null = null;

  // Période sélectionnée
  periodeActive: '3m' | '6m' | '1a' = '6m';
  periodes = [
    { val: '3m' as const, label: '3 mois', mois: 3  },
    { val: '6m' as const, label: '6 mois', mois: 6  },
    { val: '1a' as const, label: '1 an',   mois: 12 },
  ];

  get periodeLabel(): string {
    const now   = new Date();
    const mois  = this.periodes.find(p => p.val === this.periodeActive)?.mois ?? 6;
    const debut = new Date(now.getFullYear(), now.getMonth() - mois + 1, 1);
    return `${debut.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })} — ${
      now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`;
  }

  // KPIs formatés
  get revenusFormates(): string {
    const r = this.rapport?.revenus ?? 0;
    return r >= 1000000 ? (r / 1000000).toFixed(1) + 'M' : r.toLocaleString('fr-FR');
  }

  get montantImpayeFormate(): string {
    const m = this.rapport?.montantImpaye ?? 0;
    return m.toLocaleString('fr-FR');
  }

  // Sidebar
  sidebarItems: Array<{
    label: string; icone: string; route: string;
    active: boolean; section: string;
  }> = [
    { label:'Tableau de bord', icone:'ti ti-layout-dashboard', route:'/dashboard', active:false, section:'Principal' },
    { label:'Biens',           icone:'ti ti-building',         route:'/bien',      active:false, section:'Principal' },
    { label:'Locataires',      icone:'ti ti-users',            route:'/locataire', active:false, section:'Principal' },
    { label:'Contrats',        icone:'ti ti-file-text',        route:'/contrat',   active:false, section:'Principal' },
    { label:'Paiements',       icone:'ti ti-credit-card',      route:'/paiement',  active:false, section:'Principal' },
    { label:'Rapports',        icone:'ti ti-chart-bar',        route:'/rapport',   active:true,  section:'Analyse'   },
    { label:'Paramètres',      icone:'ti ti-settings',         route:'/dashboard', active:false, section:'Système'   },
  ];

  ngOnInit(): void {
    this.chargerRapport();
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.detruireCharts();
  }

  // ── Charge le rapport selon la période ──
  chargerRapport(): void {
    this.loading = true;
    const mois = this.periodes.find(p => p.val === this.periodeActive)?.mois ?? 6;

    this.rapportService.getRapportData(mois)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: RapportData) => {
          this.rapport = data;
          this.loading = false;
          if (isPlatformBrowser(this.platformId)) {
            setTimeout(() => this.initCharts(), 150);
          }
        },
        error: (err: any) => {
          this.erreur  = 'Impossible de charger les données.';
          this.loading = false;
        }
      });
  }

  // ── Change la période ──
  changerPeriode(val: '3m' | '6m' | '1a'): void {
    this.periodeActive = val;
    this.chargerRapport();
  }

  // ── Exporter PDF ──
  exporterPDF(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    window.print();
  }

  // ── Initialise les graphiques Chart.js ──
  private initCharts(): void {
    if (!this.rapport) return;
    if (typeof (window as any)['Chart'] === 'undefined') return;
    const Chart = (window as any)['Chart'];

    this.detruireCharts();

    // ── Graphique revenus mensuels (barres groupées) ──
    const c1 = document.getElementById('chartRevenus') as HTMLCanvasElement;
    if (c1) {
      this.chartRev = new Chart(c1, {
        type: 'bar',
        data: {
          labels: this.rapport.revenusMensuels.map(m => m.label),
          datasets: [
            {
              label: 'Encaissé',
              data: this.rapport.revenusMensuels.map(m => m.encaisse),
              backgroundColor: '#2563eb',
              borderRadius: 4,
              borderSkipped: false
            },
            {
              label: 'Attendu',
              data: this.rapport.revenusMensuels.map(m => m.attendu),
              backgroundColor: '#bfdbfe',
              borderRadius: 4,
              borderSkipped: false
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (v: any) => `${v.dataset.label}: ${(v.raw / 1000000).toFixed(1)}M FCFA`
              }
            }
          },
          scales: {
            x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#94a3b8' } },
            y: {
              grid: { color: '#f1f5f9' },
              ticks: {
                font: { size: 10 }, color: '#94a3b8',
                callback: (v: any) => (v / 1000000).toFixed(0) + 'M'
              }
            }
          }
        }
      });
    }

    // ── Graphique donut — répartition revenus ──
    const c2 = document.getElementById('chartRepartition') as HTMLCanvasElement;
    if (c2) {
      const total = this.rapport.repartitionType.reduce(
        (acc: number, r) => acc + r.montant, 0
      );
      this.chartRep = new Chart(c2, {
        type: 'doughnut',
        data: {
          labels: this.rapport.repartitionType.map(r => r.type),
          datasets: [{
            data: this.rapport.repartitionType.map(r =>
              total > 0 ? Math.round((r.montant / total) * 100) : 0
            ),
            backgroundColor: ['#2563eb', '#7c3aed', '#0d9488'],
            borderWidth: 0,
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: { label: (v: any) => `${v.label}: ${v.raw}%` }
            }
          }
        }
      });
    }
  }

  private detruireCharts(): void {
    if (this.chartRev) { this.chartRev.destroy(); this.chartRev = null; }
    if (this.chartRep) { this.chartRep.destroy(); this.chartRep = null; }
  }

  getBadgeClass(statut: string): string {
    const map: Record<string, string> = {
      'Actif':      'badge-green',
      'Occupé':     'badge-green',
      'Expiration': 'badge-amber',
      'Résilié':    'badge-red',
      'Disponible': 'badge-blue',
    };
    return map[statut] ?? 'badge-gray';
  }

  setActive(index: number): void {
    this.sidebarItems.forEach((item, i) => item.active = i === index);
  }
  deconnecter(): void {
  this.authService.logout(); // redirige vers /login automatiquement
}
}