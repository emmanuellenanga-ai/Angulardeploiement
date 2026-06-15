import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { NgFor, NgClass, NgIf, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ContratService, Contrat } from '../../services/contrat';
import { BienService, Bien } from '../../services/bien';
import { LocataireService, Locataire } from '../../services/locataire';
import { AuthService } from '../../services/auth';
// Interface enrichie pour l'affichage
interface ContratRow {
  id: number;
  reference: string;
  nomLocataire: string;
  initialesLocataire: string;
  nomBien: string;
  loyer: string;
  dateDebut: string;
  dateFin: string;
  dureeMois: number;
  statut: string;
  statutClass: string;
  joursRestants: number;
  // données brutes pour la modification
  raw: Contrat;
}

@Component({
  selector: 'app-contrat',
  standalone: true,
  imports: [RouterLink, NgFor, NgClass, NgIf, FormsModule, DatePipe],
  templateUrl: './contrat.html',
  styleUrls: ['./contrat.css']
})
export class ContratComponent implements OnInit {

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private contratService: ContratService,
    private bienService: BienService,
    private locataireService: LocataireService,
    private authService: AuthService
  ) {}

  // ── Données brutes ──
  contrats: Contrat[] = [];
  biens: Bien[] = [];
  locataires: Locataire[] = [];

  // ── Lignes enrichies pour l'affichage ──
  contratsRows: ContratRow[] = [];
  contratsFiltres: ContratRow[] = [];

  loading = true;
  erreur  = '';

  // ── Stats ──
  stats = { total: 0, actifs: 0, expiration: 0, resilies: 0 };

  // ── Alerte expiration ──
  alerteExpiration = '';

  // ── Filtres ──
  recherche    = '';
  filtreStatut = '';

  // ── Pagination ──
  pageActuelle = 1;
  parPage      = 8;

  // ── Modal ──
  showModal    = false;
  modeModal: 'ajouter' | 'modifier' = 'ajouter';
  contratEnCours: Contrat = this.contratVide();
  contratIdEnCours: number | null = null;

  // ── Confirmation résiliation ──
  showConfirmResil  = false;
  contratAResilier: number | null = null;

  // ── Confirmation suppression ──
  showConfirmSuppr  = false;
  contratASupprimer: number | null = null;

  // ── Sidebar ──
  sidebarItems: Array<{
    label: string; icone: string; route: string;
    active: boolean; section: string;
  }> = [
    { label:'Tableau de bord', icone:'ti ti-layout-dashboard', route:'/dashboard', active:false, section:'Principal' },
    { label:'Biens',           icone:'ti ti-building',         route:'/bien',      active:false, section:'Principal' },
    { label:'Locataires',      icone:'ti ti-users',            route:'/locataire', active:false, section:'Principal' },
    { label:'Contrats',        icone:'ti ti-file-text',        route:'/contrat',   active:true,  section:'Principal' },
    { label:'Paiements',       icone:'ti ti-credit-card',      route:'/paiement',  active:false, section:'Principal' },
    { label:'Rapports',        icone:'ti ti-chart-bar',        route:'/dashboard', active:false, section:'Analyse'   },
    { label:'Paramètres',      icone:'ti ti-settings',         route:'/dashboard', active:false, section:'Système'   },
  ];

  Math = Math;

  ngOnInit(): void {
    this.chargerDonnees();
  }

  // ── Charge tout en parallèle ──
  chargerDonnees(): void {
    this.loading = true;
    forkJoin({
      contrats:   this.contratService.getContrats(),
      biens:      this.bienService.getBiens(),
      locataires: this.locataireService.getLocataires(),
    }).subscribe({
      next: (data: { contrats: Contrat[]; biens: Bien[]; locataires: Locataire[] }) => {
        this.contrats   = data.contrats;
        this.biens      = data.biens;
        this.locataires = data.locataires;
        this.enrichirContrats();
        this.calculerStats();
        this.verifierExpirations();
        this.appliquerFiltres();
        this.loading = false;
      },
      error: (err: any) => {
        this.erreur  = 'Impossible de charger les données.';
        this.loading = false;
      }
    });
  }

  // ── Enrichit les contrats avec noms locataires/biens ──
  private enrichirContrats(): void {
    const biensMap     = new Map(this.biens.map((b: Bien) => [b.id, b]));
    const locatairesMap = new Map(this.locataires.map((l: Locataire) => [l.id, l]));

    const pillClass: Record<string, string> = {
      'Actif':      'badge-green',
      'Expiration': 'badge-amber',
      'Résilié':    'badge-red',
    };

    this.contratsRows = this.contrats.map((c: Contrat) => {
      const loc  = locatairesMap.get(c.locataire);
      const bien = biensMap.get(c.bien);
      const nom  = loc  ? `${loc.prenom} ${loc.nom}` : '—';
      const init = loc  ? `${loc.prenom[0]}${loc.nom[0]}`.toUpperCase() : '?';

      // Calcul durée en mois
      const debut   = new Date(c.date_debut);
      const fin     = new Date(c.date_fin);
      const dureeMois = Math.round(
        (fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24 * 30)
      );

      // Jours restants
      const today = new Date();
      const joursRestants = Math.ceil(
        (fin.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      return {
        id:                  c.id ?? 0,
        reference:           c.reference ?? `CTR-${c.id}`,
        nomLocataire:        nom,
        initialesLocataire:  init,
        nomBien:             bien?.titre ?? '—',
        loyer:               c.loyer.toLocaleString('fr-FR'),
        dateDebut:           this.formatDate(c.date_debut),
        dateFin:             this.formatDate(c.date_fin),
        dureeMois,
        joursRestants,
        statut:              c.statut,
        statutClass:         pillClass[c.statut] ?? 'badge-blue',
        raw:                 c,
      };
    });
  }

  // ── Stats ──
  private calculerStats(): void {
    this.stats.total      = this.contratsRows.length;
    this.stats.actifs     = this.contratsRows.filter(c => c.statut === 'Actif').length;
    this.stats.expiration = this.contratsRows.filter(c => c.statut === 'Expiration').length;
    this.stats.resilies   = this.contratsRows.filter(c => c.statut === 'Résilié').length;
  }

  // ── Alerte si contrats expirent dans 30 jours ──
  private verifierExpirations(): void {
    const bientot = this.contratsRows.filter(
      c => c.statut === 'Actif' && c.joursRestants <= 30 && c.joursRestants > 0
    );
    if (bientot.length > 0) {
      this.alerteExpiration =
        `${bientot.length} contrat(s) expirent dans moins de 30 jours — pensez à les renouveler.`;
    }
    const expiration = this.contratsRows.filter(c => c.statut === 'Expiration');
    if (expiration.length > 0) {
      this.alerteExpiration =
        `${expiration.length} contrat(s) arrivent à expiration prochainement.`;
    }
  }

  // ── Filtres ──
  appliquerFiltres(): void {
    const q = this.recherche.toLowerCase();
    this.contratsFiltres = this.contratsRows.filter(c => {
      const matchQ = !q
        || c.reference.toLowerCase().includes(q)
        || c.nomLocataire.toLowerCase().includes(q)
        || c.nomBien.toLowerCase().includes(q);
      const matchS = !this.filtreStatut || c.statut === this.filtreStatut;
      return matchQ && matchS;
    });
    this.pageActuelle = 1;
  }

  // ── Pagination ──
  get contratsPagines(): ContratRow[] {
    const debut = (this.pageActuelle - 1) * this.parPage;
    return this.contratsFiltres.slice(debut, debut + this.parPage);
  }

  get totalPages(): number {
    return Math.ceil(this.contratsFiltres.length / this.parPage);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  changerPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.pageActuelle = page;
  }

  // ── Modal Ajouter ──
  ouvrirAjout(): void {
    this.modeModal       = 'ajouter';
    this.contratEnCours  = this.contratVide();
    this.contratIdEnCours = null;
    this.showModal       = true;
  }

  // ── Modal Modifier ──
  ouvrirModifier(row: ContratRow): void {
    this.modeModal        = 'modifier';
    this.contratEnCours   = { ...row.raw };
    this.contratIdEnCours = row.id;
    this.showModal        = true;
  }

  fermerModal(): void { this.showModal = false; }

  // ── Soumettre ──
  soumettre(): void {
    if (this.modeModal === 'ajouter') {
      this.contratService.creerContrat(this.contratEnCours).subscribe({
        next: () => { this.fermerModal(); this.chargerDonnees(); },
        error: (err: any) => { this.erreur = 'Erreur lors de la création.'; }
      });
    } else if (this.contratIdEnCours !== null) {
      this.contratService.modifierContrat(this.contratIdEnCours, this.contratEnCours).subscribe({
        next: () => { this.fermerModal(); this.chargerDonnees(); },
        error: (err: any) => { this.erreur = 'Erreur lors de la modification.'; }
      });
    }
  }

  // ── Résiliation ──
  confirmerResiliation(id: number): void {
    this.contratAResilier  = id;
    this.showConfirmResil  = true;
  }

  annulerResiliation(): void {
    this.contratAResilier  = null;
    this.showConfirmResil  = false;
  }

  resilierConfirme(): void {
    if (this.contratAResilier !== null) {
      this.contratService.resilierContrat(this.contratAResilier).subscribe({
        next: () => { this.showConfirmResil = false; this.chargerDonnees(); },
        error: (err: any) => { this.erreur = 'Erreur lors de la résiliation.'; }
      });
    }
  }

  // ── Suppression ──
  confirmerSuppression(id: number): void {
    this.contratASupprimer  = id;
    this.showConfirmSuppr   = true;
  }

  annulerSuppression(): void {
    this.contratASupprimer  = null;
    this.showConfirmSuppr   = false;
  }

  supprimerConfirme(): void {
    if (this.contratASupprimer !== null) {
      this.contratService.supprimerContrat(this.contratASupprimer).subscribe({
        next: () => { this.showConfirmSuppr = false; this.chargerDonnees(); },
        error: (err: any) => { this.erreur = 'Erreur lors de la suppression.'; }
      });
    }
  }

  setActive(index: number): void {
    this.sidebarItems.forEach((item, i) => item.active = i === index);
  }

  // ── Utilitaires ──
  private formatDate(dateStr: string): string {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR');
  }

  private contratVide(): Contrat {
    return {
      locataire: 0, bien: 0, loyer: 0,
      date_debut: '', date_fin: '',
      statut: 'Actif', observations: ''
    };
  }
  deconnecter(): void {
  this.authService.logout(); // redirige vers /login automatiquement
}
}

export type { Contrat };
