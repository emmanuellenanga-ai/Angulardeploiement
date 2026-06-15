import {
  Component, OnInit, AfterViewInit,
  Inject, PLATFORM_ID, OnDestroy
} from '@angular/core';
import { isPlatformBrowser, NgFor, NgClass, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService, DashboardData, Contrat, Paiement } from '../../services/dashboard';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '../../services/auth';
import { ChangeDetectorRef } from '@angular/core';

interface ContratRow {
  initiales: string;
  nomLocataire: string;
  nomBien: string;
  loyer: string;
  statut: string;
  statutClass: string;
}
@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, NgFor, NgClass, NgIf],
  standalone:true,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private dashboardService: DashboardService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef

  ) {}

  private destroy$ = new Subject<void>();

  dateAujourdhui = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',day: 'numeric',
    month: 'long', year: 'numeric'
  });

  stats= {
    biensActifs:    0,
    biensOccupes:   0,
    biensDispos:    0,
    tauxOccupation: 0,
    loyersEncaisses: '0',
    contratsActifs: 0,
    contratsExpiration: 0,
    locataires:     0,
  };

  chartLoyers = {
    labels: ['Jan','Fév','Mar','Avr','Mai','Jun'],
    data:   [0, 0, 0, 0, 0, 0]
  };

  chartRepartition = {
    labels: ['Maisons','Appartements','Studios'],
    data:   [0, 0, 0]
  };

  contratsRows: ContratRow[] = [];
  paiementsRows: Paiement[] = [];

  loading = true;
  erreur= '';

  sidebarItems: Array<{
  label: string;
  icone: string;
  route: string;
  active: boolean;
  badge: string | null;
  section: string;
  }>  = [
    {label: 'Tableau de bord', icone: 'ti ti-layout-dashboard', route: '/dashboard', active: true,  badge: null, section: 'Principal'},
    { label: 'Biens',           icone: 'ti ti-building',          route: '/bien',      active: true, badge: null, section: 'Principal' },
    { label: 'Locataires',      icone: 'ti ti-users',             route: '/locataire', active: true, badge: null, section: 'Principal' },
    { label: 'Contrats',        icone: 'ti ti-file-text',         route: '/contrat',   active: true, badge: null, section: 'Principal' },
    { label: 'Paiements',       icone: 'ti ti-credit-card',       route: '/paiement',  active: true, badge: null, section: 'Principal' },
    { label: 'Rapports',        icone: 'ti ti-chart-bar',         route: '/rapport', active: true, badge: null, section: 'Analyse'   },
    {label: 'Demandes visites',    icone: 'ti ti-calendar-event',     route: '/demande-visite', active: true, badge: null, section: 'Analyse'   },
    { label: 'Paramètres',      icone: 'ti ti-settings',          route: '/parametres', active: true, badge: null, section: 'Système'   },
  ];
  
  ngOnInit(): void{
    console.log('📊📊📊 DASHBOARD COMPONENT CHARGÉ');
    console.log('Initialisation du dashboard');
    this.chargerDonnees();

  }

  ngAfterViewInit(): void{

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  chargerDonnees():void{
    this.loading = true;
    this.dashboardService.getDashboardData()
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next : (data) => {
        this.calculerStats(data);
        this.preparerTableaux(data);
        this.preparerGraphiques(data);
        this.loading = false;
        this.cdr.detectChanges();

        if(isPlatformBrowser(this.platformId)){
          setTimeout(() => this.initCharts(), 100);
        }

      },
      error : (err) => {
        console.error('Erreur chargement dashboard:', err);
        this.erreur = 'Impossible de charger les données.';
        this.loading = false;
      }
    });
  }


  private calculerStats(data: DashboardData): void{
    const {biens, locataires, contrats,paiements}= data;

    this.stats.biensActifs = biens.length
    this.stats.biensOccupes = biens.filter(b => b.statut=== 'Occupé').length;
    this.stats.biensDispos = biens.filter(b => b.statut=== 'Disponible').length;
    this.stats.tauxOccupation = biens.length > 0 ? 
     Math.round((this.stats.biensOccupes/ biens.length)*100)
     :0;
    this.stats.locataires = locataires.length;
    this.stats.contratsActifs = contrats.filter(c => c.statut==='Actif').length;
    this.stats.contratsExpiration = contrats.filter(c=> c.statut==='Expiré').length;

    const total: number = paiements
     .filter(p => p.statut === 'Payé')
     .reduce((sum, p) => sum + p.montant, 0)

    this.stats.loyersEncaisses = total >= 1000000
     ? (total / 1000000).toFixed(1)+'M'
     :total.toLocaleString('fr-FR');

    const bienItem = this.sidebarItems.find(s => s.label ==='Biens');
    if (bienItem) bienItem.badge = String(this.stats.biensDispos);

    const paiementItem = this.sidebarItems.find(s => s.label ==='Paiements');
    if(paiementItem) paiementItem.badge = String (paiements.filter(p => p.statut ==='Impayé').length);


  }

  private preparerTableaux(data: DashboardData): void{
    const {biens, locataires, contrats, paiements}= data;

    const biensMap    = new Map(biens.map(b => [b.id, b]));
    const locatairesMap = new Map(locataires.map(l => [l.id, l]));

    const pillClass: Record<string, string > = {
      'Actif':       'pill-green',
      'Payé':        'pill-green',
      'En attente':  'pill-blue',
      'Expiration':  'pill-amber',
      'Impayé':      'pill-red',
      'Résilié':     'pill-red',
    };

    this.contratsRows = contrats.slice(-5).reverse().map(c => {
      const loc = locatairesMap.get(c.locataire);
      const bien = biensMap.get(c.bien);
      const nom = loc ? `${loc.prenom} ${loc.nom}`: '-';
      const init = loc ? `${loc.prenom[0]} ${loc.nom[0]}`: '?';
      return {
        initiales:    init.toUpperCase(),
        nomLocataire: nom,
        nomBien:      bien ? bien.adresse : '-',
        loyer:        c.loyer.toLocaleString('fr-FR'),
        statut:       c.statut,
        statutClass:  pillClass[c.statut] ?? 'pill-blue',
      };
    });
  }

  private preparerGraphiques(data: DashboardData): void{
    const { biens, paiements }= data;
    this.chartRepartition.data = [
      biens.filter (b =>b.categorie ==='Maison').length,
       biens.filter (b =>b.categorie ==='Appartement').length,
        biens.filter (b =>b.categorie ==='Studio').length,
      
    ];
    const maintenant = new Date();
    const moisLabels: string[] = [];
    const moisData: number[]   = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(maintenant.getFullYear(), maintenant.getMonth() - i, 1);
      const label = d.toLocaleDateString('fr-FR', { month: 'short' });
      const annee = d.getFullYear();
      const moisStr = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

      const total = paiements
        .filter(p => p.statut === 'Payé' && p.mois === moisStr)
        .reduce((s, p) => s + p.montant, 0);

      moisLabels.push(label.charAt(0).toUpperCase() + label.slice(1));
      moisData.push(total);
    }

    this.chartLoyers.labels = moisLabels;
    this.chartLoyers.data   = moisData;
  }
  
  private initCharts(): void {
    if (typeof (window as any)['Chart'] === 'undefined') return;
    const Chart = (window as any)['Chart'];

    // Détruit les anciens graphiques si rechargement
    ['chartLoyers','chartRep'].forEach(id => {
      const existing = Chart.getChart(id);
      if (existing) existing.destroy();
    });

  const c1 = document.getElementById('chartLoyers') as HTMLCanvasElement;
    if (c1) {
      const maxVal = Math.max(...this.chartLoyers.data);
      const colors = this.chartLoyers.data.map((v, i) =>
        i === this.chartLoyers.data.length - 1 ? '#2563eb' :
        v === maxVal ? '#60a5fa' : '#bfdbfe'
      );
      new Chart(c1, {
        type: 'bar',
        data: {
          labels: this.chartLoyers.labels,
          datasets: [{
            data: this.chartLoyers.data,
            backgroundColor: colors,
            borderRadius: 5,
            borderSkipped: false
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { callbacks: {
              label: (v: any) => v.raw >= 1000000
                ? (v.raw/1000000).toFixed(1)+'M FCFA'
                : v.raw.toLocaleString('fr-FR')+' FCFA'
            }}
          },
          scales: {
            x: { grid:{display:false}, ticks:{font:{size:11},color:'#94a3b8'} },
            y: { grid:{color:'#f1f5f9'}, ticks:{font:{size:10},color:'#94a3b8',
              callback: (v: any) => v >= 1000000 ? (v/1000000).toFixed(0)+'M' : v
            }}
          }
        }
      });
    }
  }
  setActive(index: number): void {
    this.sidebarItems.forEach((item, i) => item.active = i === index);
  }
  deconnecter(): void {
  this.authService.logout(); // redirige vers /login automatiquement
}
}