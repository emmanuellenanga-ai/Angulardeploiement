import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { NgFor, NgClass, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LocataireService, Locataire } from '../../services/locataire';
import { BienService, Bien } from '../../services/bien';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-locataire',
  standalone: true,
  imports: [RouterLink, NgFor, NgClass, NgIf, FormsModule],
  templateUrl: './locataire.html',
  styleUrls: ['./locataire.css']
})
export class LocataireComponent implements OnInit {

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private locataireService: LocataireService,
    private bienService: BienService,
    private authService: AuthService
  ) {}

  // ── Données ──
  locataires: Locataire[] = [];
  locatairesFiltres: Locataire[] = [];
  biens: Bien[] = [];
  loading = true;
  erreur  = '';

  // ── Stats ──
  stats = { total: 0, actifs: 0, inactifs: 0, impayes: 0 };

  // ── Filtres ──
  recherche    = '';
  filtreStatut = '';
  filtreBien   = '';

  // ── Pagination ──
  pageActuelle = 1;
  parPage      = 8;

  // ── Modal ──
  showModal    = false;
  modeModal: 'ajouter' | 'modifier' = 'ajouter';
  locEnCours: Locataire = this.locataireVide();
  locIdEnCours: number | null = null;

  // ── Confirmation suppression ──
  showConfirmSuppr  = false;
  locASupprimer: number | null = null;

  // ── Sidebar ──
  sidebarItems: Array<{label:string;icone:string;route:string;active:boolean;section:string}> = [
    { label:'Tableau de bord', icone:'ti ti-layout-dashboard', route:'/dashboard', active:false, section:'Principal' },
    { label:'Biens',           icone:'ti ti-building',         route:'/bien',      active:false, section:'Principal' },
    { label:'Locataires',      icone:'ti ti-users',            route:'/locataire', active:true,  section:'Principal' },
    { label:'Contrats',        icone:'ti ti-file-text',        route:'/contrat',   active:false, section:'Principal' },
    { label:'Paiements',       icone:'ti ti-credit-card',      route:'/paiement',  active:false, section:'Principal' },
    { label:'Rapports',        icone:'ti ti-chart-bar',        route:'/dashboard', active:false, section:'Analyse'   },
    { label:'Paramètres',      icone:'ti ti-settings',         route:'/dashboard', active:false, section:'Système'   },
  ];

  ngOnInit(): void {
    this.chargerDonnees();
  }

  // ── Charge locataires + biens en parallèle ──
  chargerDonnees(): void {
    this.loading = true;
    forkJoin({
      locataires: this.locataireService.getLocataires(),
      biens:      this.bienService.getBiens()
    }).subscribe({
      next: (data: { locataires: Locataire[]; biens: Bien[] }) => {
        this.locataires = data.locataires;
        this.biens      = data.biens;
        this.calculerStats();
        this.appliquerFiltres();
        this.loading = false;
      },
      error: (err: any) => {
        this.erreur  = 'Impossible de charger les données.';
        this.loading = false;
      }
    });
  }

  // ── Stats ──
  calculerStats(): void {
    this.stats.total    = this.locataires.length;
    this.stats.actifs   = this.locataires.filter((l: Locataire) => l.statut === 'Actif').length;
    this.stats.inactifs = this.locataires.filter((l: Locataire) => l.statut === 'Inactif').length;
    this.stats.impayes  = 0; // Sera calculé depuis les paiements plus tard
  }

  // ── Filtre ──
  appliquerFiltres(): void {
    const q = this.recherche.toLowerCase();
    this.locatairesFiltres = this.locataires.filter((l: Locataire) => {
      const matchQ = !q
        || `${l.prenom} ${l.nom}`.toLowerCase().includes(q)
        || l.email.toLowerCase().includes(q)
        || l.telephone.includes(q);
      const matchS = !this.filtreStatut || l.statut === this.filtreStatut;
      const matchB = !this.filtreBien   || l.bien === Number(this.filtreBien);
      return matchQ && matchS && matchB;
    });
    this.pageActuelle = 1;
  }

  // ── Pagination ──
  get locatairesPagines(): Locataire[] {
    const debut = (this.pageActuelle - 1) * this.parPage;
    return this.locatairesFiltres.slice(debut, debut + this.parPage);
  }

  get totalPages(): number {
    return Math.ceil(this.locatairesFiltres.length / this.parPage);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  changerPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.pageActuelle = page;
  }

  // ── Nom du bien par ID ──
  getNomBien(bienId: number | undefined): string {
    if (!bienId) return '—';
    return this.biens.find((b: Bien) => b.id === bienId)?.titre ?? '—';
  }

  // ── Initiales ──
  getInitiales(loc: Locataire): string {
    return `${loc.prenom[0]}${loc.nom[0]}`.toUpperCase();
  }

  // ── Badge CSS ──
  getBadgeClass(statut: string): string {
    const map: Record<string, string> = {
      'Actif':      'badge-green',
      'Inactif':    'badge-amber',
      'Payé':       'badge-green',
      'En attente': 'badge-blue',
      'Impayé':     'badge-red',
    };
    return map[statut] ?? 'badge-gray';
  }

  // ── Modal ──
  ouvrirAjout(): void {
    this.modeModal   = 'ajouter';
    this.locEnCours  = this.locataireVide();
    this.locIdEnCours = null;
    this.showModal   = true;
  }

  ouvrirModifier(loc: Locataire): void {
    this.modeModal    = 'modifier';
    this.locEnCours   = { ...loc };
    this.locIdEnCours = loc.id ?? null;
    this.showModal    = true;
  }

  fermerModal(): void { this.showModal = false; }

  soumettre(): void {
    if (this.modeModal === 'ajouter') {
      this.locataireService.creerLocataire(this.locEnCours).subscribe({
        next: () => { this.fermerModal(); this.chargerDonnees(); },
        error: (err: any) => { this.erreur = 'Erreur lors de la création.'; }
      });
    } else if (this.locIdEnCours !== null) {
      this.locataireService.modifierLocataire(this.locIdEnCours, this.locEnCours).subscribe({
        next: () => { this.fermerModal(); this.chargerDonnees(); },
        error: (err: any) => { this.erreur = 'Erreur lors de la modification.'; }
      });
    }
  }

  // ── Suppression ──
  confirmerSuppression(id: number): void {
    this.locASupprimer   = id;
    this.showConfirmSuppr = true;
  }

  annulerSuppression(): void {
    this.locASupprimer   = null;
    this.showConfirmSuppr = false;
  }

  supprimerConfirme(): void {
    if (this.locASupprimer !== null) {
      this.locataireService.supprimerLocataire(this.locASupprimer).subscribe({
        next: () => { this.showConfirmSuppr = false; this.chargerDonnees(); },
        error: (err: any) => { this.erreur = 'Erreur lors de la suppression.'; }
      });
    }
  }

  setActive(index: number): void {
    this.sidebarItems.forEach((item, i) => item.active = i === index);
  }

  private locataireVide(): Locataire {
    return {
      nom: '', prenom: '', telephone: '', email: '',
      statut: 'Actif', date_entree: '', profession: '', observations: '',
      numero_cni: '', adresse: ''
    };
  }
  deconnecter(): void {
  this.authService.logout(); // redirige vers /login automatiquement
}

  // Exposer Math pour le template
  Math = Math;
}

export type { Locataire };
