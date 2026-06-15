import {
  Component, OnInit, Inject, PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser, NgFor, NgClass, NgIf, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BienService, Bien } from '../../services/bien';
import {AuthService} from '../../services/auth';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-bien',
  standalone: true,
  imports: [RouterLink, NgFor, NgClass, NgIf, FormsModule, DecimalPipe],
  templateUrl: './bien.html',
  styleUrls: ['./bien.css']
})
export class BienComponent implements OnInit {
Math: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private bienService: BienService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  // ── Données ──
  biens: Bien[] = [];
  biensFiltres: Bien[] = [];
  loading = true;
  erreur = '';

  // ── Stats calculées ──
  stats = { total: 0, occupes: 0, disponibles: 0, travaux: 0 };

  // ── Filtres ──
  recherche   = '';
  filtreStatut = '';
  filtreType   = '';

  // ── Pagination ──
  pageActuelle = 1;
  parPage      = 8;

  // ── Vue liste/grille ──
  vue: 'liste' | 'grille' = 'liste';

  // ── Modal ──
  showModal   = false;
  modeModal: 'ajouter' | 'modifier' = 'ajouter';
  bienEnCours: Bien = this.bienVide();
  bienIdEnCours: number | null = null;

  // ── Confirmation suppression ──
  showConfirmSuppr = false;
  bienASupprimer: number | null = null;

  // Sidebar items
  sidebarItems = [
    { label: 'Tableau de bord', icone: 'ti ti-layout-dashboard', route: '/dashboard', active: false },
    { label: 'Biens',           icone: 'ti ti-building',          route: '/bien',      active: true  },
    { label: 'Locataires',      icone: 'ti ti-users',             route: '/locataire', active: false },
    { label: 'Contrats',        icone: 'ti ti-file-text',         route: '/contrat',   active: false },
    { label: 'Paiements',       icone: 'ti ti-credit-card',       route: '/paiement',  active: false },
    { label: 'Rapports',        icone: 'ti ti-chart-bar',         route: '/dashboard', active: false },
    { label: 'Paramètres',      icone: 'ti ti-settings',          route: '/dashboard', active: false },
  ];

  ngOnInit(): void {
    this.chargerBiens();
  }

  // ── Charge les biens depuis l'API ──
  chargerBiens(): void {
    this.loading = true;
    this.bienService.getBiens().subscribe({
      next: (data) => {
        this.biens = data;
        this.calculerStats();
        this.appliquerFiltres();
        this.loading = false;
        this.cdr.detectChanges();
      },
      
      error: (err) => {
        this.erreur = 'Impossible de charger les biens.';
        this.loading = false;
      }
    });
  }

  // ── Calcule les stats ──
  calculerStats(): void {
    this.stats.total       = this.biens.length;
    this.stats.occupes     = this.biens.filter(b => b.statut === 'Occupé').length;
    this.stats.disponibles = this.biens.filter(b => b.statut === 'Disponible').length;
    this.stats.travaux     = this.biens.filter(b => b.statut === 'En travaux').length;
  }

  // ── Filtre + recherche ──
  appliquerFiltres(): void {
    const q = this.recherche.toLowerCase();
    this.biensFiltres = this.biens.filter(b => {
      const matchQ = !q
        || b.titre.toLowerCase().includes(q)
        || b.quartier_nom.toLowerCase().includes(q);
      const matchS = !this.filtreStatut || b.statut === this.filtreStatut;
      const matchT = !this.filtreType   || b.categorie   === this.filtreType;
      return matchQ && matchS && matchT;
    });
    this.pageActuelle = 1;
  }

  // ── Pagination ──
  get biensPagines(): Bien[] {
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
    if (page >= 1 && page <= this.totalPages) {
      this.pageActuelle = page;
    }
  }

  // ── Modal Ajouter ──
  ouvrirAjout(): void {
    this.modeModal    = 'ajouter';
    this.bienEnCours  = this.bienVide();
    this.bienIdEnCours = null;
    this.showModal    = true;
  }

  // ── Modal Modifier ──
  ouvrirModifier(bien: Bien): void {
    this.modeModal     = 'modifier';
    this.bienEnCours   = { ...bien };
    this.bienIdEnCours = bien.id ?? null;
    this.showModal     = true;
  }

  fermerModal(): void {
    this.showModal = false;
  }

  // ── Soumettre le formulaire (ajouter ou modifier) ──
  soumettre(): void {
    if (this.modeModal === 'ajouter') {
      this.bienService.creerBien(this.bienEnCours).subscribe({
        next: () => { this.fermerModal(); this.chargerBiens(); },
        error: () => { this.erreur = 'Erreur lors de la création.'; }
      });
    } else if (this.bienIdEnCours !== null) {
      this.bienService.modifierBien(this.bienIdEnCours, this.bienEnCours).subscribe({
        next: () => { this.fermerModal(); this.chargerBiens(); },
        error: () => { this.erreur = 'Erreur lors de la modification.'; }
      });
    }
  }

  // ── Confirmer suppression ──
  confirmerSuppression(id: number): void {
    this.bienASupprimer  = id;
    this.showConfirmSuppr = true;
  }

  annulerSuppression(): void {
    this.bienASupprimer  = null;
    this.showConfirmSuppr = false;
  }

  supprimerConfirme(): void {
    if (this.bienASupprimer !== null) {
      this.bienService.supprimerBien(this.bienASupprimer).subscribe({
        next: () => { this.showConfirmSuppr = false; this.chargerBiens(); },
        error: () => { this.erreur = 'Erreur lors de la suppression.'; }
      });
    }
  }

  // ── Retourne le style du badge statut ──
  getBadgeClass(statut: string): string {
    const map: Record<string, string> = {
      'Disponible': 'badge-blue',
      'Occupé':     'badge-green',
      'En travaux': 'badge-amber',
    };
    return map[statut] ?? 'badge-gray';
  }

  // ── Bien vide pour le formulaire ──
  private bienVide(): Bien {
    return {
      titre: '', quartier_nom: '', categorie: 'Maison',
      statut: 'Disponible', loyer_mensuel: 0,
      nombre_chambre: 1, surface: 0, description: ''
    };
  }

  setActive(index: number): void {
    this.sidebarItems.forEach((item, i) => item.active = i === index);
  }
  deconnecter(): void {
  this.authService.logout(); // redirige vers /login automatiquement
}
}