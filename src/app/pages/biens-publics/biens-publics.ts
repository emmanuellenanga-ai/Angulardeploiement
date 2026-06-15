import { Component, OnInit, Inject } from '@angular/core';
import { NgFor, NgClass, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BiensPublicsService, BienPublic } from '../../services/biens-publics';

@Component({
  selector: 'app-biens-publics',
  standalone: true,
  imports: [RouterLink, NgFor, NgClass, NgIf, FormsModule],
  templateUrl: './biens-publics.html',
  styleUrls: ['./biens-publics.css']
})
export class BiensPublicsComponent implements OnInit {

  constructor(@Inject(BiensPublicsService) private biensService: BiensPublicsService) {}

  telephone = '+237 6 95 12 34 56';

  biens: BienPublic[] = [];
  biensFiltres: BienPublic[] = [];
  favoris: Set<number> = new Set();

  loading = true;
  erreur  = '';

  // ── Filtres ──
  filtreType  = '';
  filtreLoc   = '';
  filtreBudget = '';
  tri = 'recent';

  vue: 'grille' | 'liste' = 'grille';

  // ── Listes dynamiques pour les selects ──
  types: string[] = [];
  localisations: string[] = [];

  ngOnInit(): void {
    this.chargerBiens();
  }

  chargerBiens(): void {
    this.loading = true;
    this.biensService.getBiensPublics().subscribe({
      next: (data: BienPublic[]) => {
        // Garde uniquement Disponible / Occupé (pas "En travaux")
        this.biens = data.filter((b: BienPublic) => b.statut !== 'En travaux');
        this.construireFiltres();
        this.appliquerFiltres();
        this.loading = false;
      },
      error: (err: any) => {
        this.erreur  = 'Impossible de charger les biens pour le moment.';
        this.loading = false;
      }
    });
  }

  private construireFiltres(): void {
    this.types = Array.from(new Set(this.biens.map((b: BienPublic) => b.type)));
    this.localisations = Array.from(
      new Set(this.biens.map((b: BienPublic) => b.localisation.split(',')[0].trim()))
    );
  }

  appliquerFiltres(): void {
    let res = [...this.biens];

    if (this.filtreType) {
      res = res.filter((b: BienPublic) => b.type === this.filtreType);
    }
    if (this.filtreLoc) {
      res = res.filter((b: BienPublic) => b.localisation.includes(this.filtreLoc));
    }
    if (this.filtreBudget) {
      const max = Number(this.filtreBudget);
      res = res.filter((b: BienPublic) => b.loyer_mensuel <= max);
    }

    if (this.tri === 'prix-asc') {
      res = res.sort((a: BienPublic, b: BienPublic) => a.loyer_mensuel - b.loyer_mensuel);
    } else if (this.tri === 'prix-desc') {
      res = res.sort((a: BienPublic, b: BienPublic) => b.loyer_mensuel - a.loyer_mensuel);
    } else {
      // 'recent' → par id décroissant (le plus récent en premier)
      res = res.sort((a: BienPublic, b: BienPublic) => b.id - a.id);
    }

    this.biensFiltres = res;
  }

  // ── Quartiers disponibles ──
  get quartiers(): string[] {
    return this.localisations;
  }

  // ── Image par défaut selon le type ──
  getImageUrl(bien: BienPublic): string {
    if (bien.image) return bien.image;
    const defaults: Record<string, string> = {
      'Maison':      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=500&q=70',
      'Appartement': 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=500&q=70',
      'Studio':      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=500&q=70',
    };
    return defaults[bien.type] ?? defaults['Maison'];
  }

  getBadgeClass(statut: string): string {
    return statut === 'Disponible' ? 'badge-dispo' : 'badge-occ';
  }

  toggleFavori(id: number): void {
    if (this.favoris.has(id)) {
      this.favoris.delete(id);
    } else {
      this.favoris.add(id);
    }
  }

  isFavori(id: number): boolean {
    return this.favoris.has(id);
  }
}
