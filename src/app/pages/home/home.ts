import {
  Component, OnInit, AfterViewInit,
  Inject, PLATFORM_ID, OnDestroy
} from '@angular/core';
import { isPlatformBrowser, NgFor, NgClass, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HomeService, HomeStats, BienVedette } from '../../services/home';
import {DecimalPipe} from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, NgFor, NgClass, NgIf,DecimalPipe],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private homeService: HomeService
  ) {}

  private destroy$ = new Subject<void>();

  // ── État chargement ──
  loadingStats = true;
  loadingBiens = true;
  erreurStats  = '';
  erreurBiens  = '';

  // ── Stats dynamiques ──
  stats: HomeStats = {
    biensDisponibles: 0,
    biensOccupes:     0,
    contratsActifs:   0,
    loyersEncaisses:  0,
    locataires:       0,
  };

  // ── Biens en vedette ──
  biens: BienVedette[] = [];

  // ── Stats formatées pour l'affichage ──
  get loyersFormates(): string {
    const l = this.stats.loyersEncaisses;
    return l >= 1000000
      ? (l / 1000000).toFixed(1) + 'M'
      : l.toLocaleString('fr-FR');
  }

  get tauxOccupation(): number {
    const total = this.stats.biensDisponibles + this.stats.biensOccupes;
    return total > 0
      ? Math.round((this.stats.biensOccupes / total) * 100)
      : 0;
  }

  // ── Téléphone agence ──
  telephone = '+237 6 95 12 34 56';

  // ── Avantages (statiques) ──
  avantages = [
    { titre: 'Sécurisé',           description: 'Vos données sont protégées avec les meilleures technologies.',     iconeClass: 'ti ti-shield-check', couleur: 'wi-blue'   },
    { titre: 'Gain de temps',       description: 'Automatisez vos tâches et gagnez en productivité au quotidien.',   iconeClass: 'ti ti-clock',        couleur: 'wi-teal'   },
    { titre: 'Suivi en temps réel', description: 'Suivez vos biens, loyers et contrats en temps réel.',              iconeClass: 'ti ti-chart-line',   couleur: 'wi-green'  },
    { titre: 'Support 24/7',        description: 'Notre équipe est disponible pour vous accompagner à tout moment.', iconeClass: 'ti ti-headset',      couleur: 'wi-purple' },
  ];

  // ── Recherche ──
  recherche = { typeBien: '', localisation: '', prixMax: '' };

  ngOnInit(): void {
    this.chargerStats();
    this.chargerBiens();
  }

  ngAfterViewInit(): void {
    // Les compteurs seront lancés après chargement des stats
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Charge les stats depuis Django ──
  chargerStats(): void {
    this.loadingStats = true;
    this.homeService.getStats()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: HomeStats) => {
          this.stats       = data;
          this.loadingStats = false;
          // Lance les compteurs APRÈS le rendu
          if (isPlatformBrowser(this.platformId)) {
            setTimeout(() => this.animerCompteurs(), 100);
          }
        },
        error: () => {
          this.erreurStats  = 'Impossible de charger les statistiques.';
          this.loadingStats = false;
        }
      });
  }

  // ── Charge les biens en vedette ──
  chargerBiens(): void {
    this.loadingBiens = true;
    this.homeService.getBiensVedette()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: BienVedette[]) => {
          this.biens       = data;
          this.loadingBiens = false;
        },
        error: () => {
          this.erreurBiens  = 'Impossible de charger les biens.';
          this.loadingBiens = false;
        }
      });
  }

  // ── Toggle favori ──
  toggleFavori(i: number): void {
    this.biens[i].favori = !this.biens[i].favori;
  }

  // ── Lancer la recherche ──
  lancerRecherche(): void {
    console.log('Recherche:', this.recherche);
  }

  // ── Badge statut bien ──
  getBadgeClass(statut: string): string {
    const map: Record<string, string> = {
      'Disponible': 'badge-blue',
      'Occupé':     'badge-green',
      'En travaux': 'badge-amber',
    };
    return map[statut] ?? 'badge-gray';
  }

  // ── Image par défaut si pas d'image ──
  getImageUrl(bien: BienVedette): string {
    if (bien.image) return bien.image;
    const defaults: Record<string, string> = {
      'Maison':       'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=600&q=80',
      'Appartement':  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80',
      'Studio':       'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600&q=80',
    };
    return defaults[bien.type] ?? defaults['Maison'];
  }

  // ── Anime les compteurs stats ──
  private animerCompteurs(): void {
    const counters = document.querySelectorAll<HTMLElement>('[data-target]');
    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-target') || '0', 10);
      const step   = target / (1600 / 16);
      let current  = 0;
      const timer  = setInterval(() => {
        current += step;
        if (current >= target) {
          counter.textContent = target.toLocaleString('fr-FR');
          clearInterval(timer);
        } else {
          counter.textContent = Math.floor(current).toLocaleString('fr-FR');
        }
      }, 16);
    });
  }
}
