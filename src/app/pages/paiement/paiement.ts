import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { NgFor, NgClass, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { PaiementService, Paiement } from '../../services/paiement';
import { ContratService, Contrat } from '../../services/contrat';
import { LocataireService, Locataire } from '../../services/locataire';
import { BienService, Bien } from '../../services/bien';
import { AuthService } from '../../services/auth';
interface PaiementRow {
  id: number;
  reference: string;
  nomLocataire: string;
  initialesLocataire: string;
  nomBien: string;
  refContrat: string;
  montant: string;
  montantNum: number;
  mois: string;
  datePaiement: string;
  modePaiement: string;
  statut: string;
  statutClass: string;
  raw: Paiement;
}

@Component({
  selector: 'app-paiement',
  standalone: true,
  imports: [RouterLink, NgFor, NgClass, NgIf, FormsModule],
  templateUrl: './paiement.html',
  styleUrls: ['./paiement.css']
})
export class PaiementComponent implements OnInit {

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private paiementService: PaiementService,
    private contratService: ContratService,
    private locataireService: LocataireService,
    private bienService: BienService,
    private authService: AuthService
  ) {}

  // ── Données ──
  paiements: Paiement[] = [];
  contrats: Contrat[] = [];
  locataires: Locataire[] = [];
  biens: Bien[] = [];

  paiementsRows: PaiementRow[] = [];
  paiementsFiltres: PaiementRow[] = [];

  loading = true;
  erreur  = '';

  // ── Stats ──
  stats = {
    totalEncaisse: '0',
    nombrePayes: 0,
    enAttente: 0,
    impayes: 0
  };

  // ── Filtres ──
  recherche    = '';
  filtreStatut = '';
  filtreMois   = '';

  // ── Pagination ──
  pageActuelle = 1;
  parPage      = 8;

  // ── Modal ──
  showModal    = false;
  modeModal: 'ajouter' | 'modifier' = 'ajouter';
  paiementEnCours: Paiement = this.paiementVide();
  paiementIdEnCours: number | null = null;

  // ── Confirmation suppression ──
  showConfirmSuppr    = false;
  paiementASupprimer: number | null = null;

  // ── Modes de paiement ──
  modesPaiement = ['Espèces', 'Virement', 'Mobile Money', 'Chèque'];

  // ── Mois disponibles (générés dynamiquement) ──
  moisDisponibles: string[] = [];

  // ── Sidebar ──
  sidebarItems: Array<{
    label: string; icone: string; route: string;
    active: boolean; section: string;
  }> = [
    { label:'Tableau de bord', icone:'ti ti-layout-dashboard', route:'/dashboard', active:false, section:'Principal' },
    { label:'Biens',           icone:'ti ti-building',         route:'/bien',      active:false, section:'Principal' },
    { label:'Locataires',      icone:'ti ti-users',            route:'/locataire', active:false, section:'Principal' },
    { label:'Contrats',        icone:'ti ti-file-text',        route:'/contrat',   active:false, section:'Principal' },
    { label:'Paiements',       icone:'ti ti-credit-card',      route:'/paiement',  active:true,  section:'Principal' },
    { label:'Rapports',        icone:'ti ti-chart-bar',        route:'/dashboard', active:false, section:'Analyse'   },
    { label:'Paramètres',      icone:'ti ti-settings',         route:'/dashboard', active:false, section:'Système'   },
  ];

  Math = Math;

  ngOnInit(): void {
    this.genererMois();
    this.chargerDonnees();
  }

  // ── Génère les 12 derniers mois ──
  private genererMois(): void {
    const mois = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      mois.push(d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }));
    }
    this.moisDisponibles = mois;
  }

  // ── Charge tout en parallèle ──
  chargerDonnees(): void {
    this.loading = true;
    forkJoin({
      paiements:  this.paiementService.getPaiements(),
      contrats:   this.contratService.getContrats(),
      locataires: this.locataireService.getLocataires(),
      biens:      this.bienService.getBiens(),
    }).subscribe({
      next: (data: {
        paiements: Paiement[];
        contrats: Contrat[];
        locataires: Locataire[];
        biens: Bien[];
      }) => {
        this.paiements  = data.paiements;
        this.contrats   = data.contrats;
        this.locataires = data.locataires;
        this.biens      = data.biens;
        this.enrichirPaiements();
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

  // ── Enrichit les paiements ──
  private enrichirPaiements(): void {
    const locatairesMap = new Map(this.locataires.map((l: Locataire) => [l.id, l]));
    const contratsMap   = new Map(this.contrats.map((c: Contrat) => [c.id, c]));
    const biensMap      = new Map(this.biens.map((b: Bien) => [b.id, b]));

    const pillClass: Record<string, string> = {
      'Payé':       'badge-green',
      'En attente': 'badge-blue',
      'Impayé':     'badge-red',
    };

    this.paiementsRows = this.paiements.map((p: Paiement) => {
      const loc     = locatairesMap.get(p.locataire);
      const contrat = contratsMap.get(p.contrat);
      const bien    = contrat ? biensMap.get(contrat.bien) : undefined;

      const nom  = loc ? `${loc.prenom} ${loc.nom}` : '—';
      const init = loc ? `${loc.prenom[0]}${loc.nom[0]}`.toUpperCase() : '?';

      return {
        id:                  p.id ?? 0,
        reference:           p.reference ?? `PAY-${p.id}`,
        nomLocataire:        nom,
        initialesLocataire:  init,
        nomBien:             bien?.titre ?? '—',
        refContrat:          contrat?.reference ?? `CTR-${p.contrat}`,
        montant:             p.montant.toLocaleString('fr-FR'),
        montantNum:          p.montant,
        mois:                p.mois,
        datePaiement:        p.date_paiement
          ? new Date(p.date_paiement).toLocaleDateString('fr-FR')
          : '—',
        modePaiement:        p.mode_paiement ?? '—',
        statut:              p.statut,
        statutClass:         pillClass[p.statut] ?? 'badge-blue',
        raw:                 p,
      };
    });
  }

  // ── Stats ──
  private calculerStats(): void {
    const payes = this.paiementsRows.filter(p => p.statut === 'Payé');
    const totalEnc = payes.reduce((acc: number, p: PaiementRow) => acc + p.montantNum, 0);

    this.stats.totalEncaisse = totalEnc >= 1000000
      ? (totalEnc / 1000000).toFixed(1) + 'M'
      : totalEnc.toLocaleString('fr-FR');

    this.stats.nombrePayes = payes.length;
    this.stats.enAttente   = this.paiementsRows.filter(p => p.statut === 'En attente').length;
    this.stats.impayes     = this.paiementsRows.filter(p => p.statut === 'Impayé').length;
  }

  // ── Filtres ──
  appliquerFiltres(): void {
    const q = this.recherche.toLowerCase();
    this.paiementsFiltres = this.paiementsRows.filter((p: PaiementRow) => {
      const matchQ = !q
        || p.nomLocataire.toLowerCase().includes(q)
        || p.reference.toLowerCase().includes(q)
        || p.nomBien.toLowerCase().includes(q);
      const matchS = !this.filtreStatut || p.statut === this.filtreStatut;
      const matchM = !this.filtreMois   || p.mois === this.filtreMois;
      return matchQ && matchS && matchM;
    });
    this.pageActuelle = 1;
  }

  // ── Pagination ──
  get paiementsPagines(): PaiementRow[] {
    const debut = (this.pageActuelle - 1) * this.parPage;
    return this.paiementsFiltres.slice(debut, debut + this.parPage);
  }

  get totalPages(): number {
    return Math.ceil(this.paiementsFiltres.length / this.parPage);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  changerPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) this.pageActuelle = page;
  }

  // ── Modal ──
  ouvrirAjout(): void {
    this.modeModal         = 'ajouter';
    this.paiementEnCours   = this.paiementVide();
    this.paiementIdEnCours = null;
    this.showModal         = true;
  }

  ouvrirModifier(row: PaiementRow): void {
    this.modeModal         = 'modifier';
    this.paiementEnCours   = { ...row.raw };
    this.paiementIdEnCours = row.id;
    this.showModal         = true;
  }

  fermerModal(): void { this.showModal = false; }

  soumettre(): void {
    if (this.modeModal === 'ajouter') {
      this.paiementService.enregistrerPaiement(this.paiementEnCours).subscribe({
        next: () => { this.fermerModal(); this.chargerDonnees(); },
        error: (err: any) => { this.erreur = 'Erreur lors de l\'enregistrement.'; }
      });
    } else if (this.paiementIdEnCours !== null) {
      this.paiementService.modifierPaiement(this.paiementIdEnCours, this.paiementEnCours).subscribe({
        next: () => { this.fermerModal(); this.chargerDonnees(); },
        error: (err: any) => { this.erreur = 'Erreur lors de la modification.'; }
      });
    }
  }

  // ── Télécharger reçu PDF ──
  telechargerRecu(id: number): void {
    this.paiementService.telechargerRecu(id).subscribe({
      next: (blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a   = document.createElement('a');
        a.href    = url;
        a.download = `recu-paiement-${id}.pdf`;
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err: any) => { this.erreur = 'Erreur téléchargement reçu.'; }
    });
  }

  // ── Suppression ──
  confirmerSuppression(id: number): void {
    this.paiementASupprimer = id;
    this.showConfirmSuppr   = true;
  }

  annulerSuppression(): void {
    this.paiementASupprimer = null;
    this.showConfirmSuppr   = false;
  }

  supprimerConfirme(): void {
    if (this.paiementASupprimer !== null) {
      this.paiementService.supprimerPaiement(this.paiementASupprimer).subscribe({
        next: () => { this.showConfirmSuppr = false; this.chargerDonnees(); },
        error: (err: any) => { this.erreur = 'Erreur lors de la suppression.'; }
      });
    }
  }

  setActive(index: number): void {
    this.sidebarItems.forEach((item, i) => item.active = i === index);
  }

  private paiementVide(): Paiement {
    return {
      locataire: 0, contrat: 0, montant: 0,
      mois: '', statut: 'En attente',
      mode_paiement: 'Espèces', notes: ''
    };
  }
  deconnecter(): void {
  this.authService.logout(); // redirige vers /login automatiquement
}
}

export type { Paiement };
