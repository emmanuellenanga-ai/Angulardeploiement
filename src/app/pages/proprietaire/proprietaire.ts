import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { NgFor, NgClass, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ProprietaireService, Proprietaire } from '../../services/proprietaire';
import { BienService, Bien } from '../../services/bien';
import { AuthService } from '../../services/auth';
interface ProprietaireRow {
  proprietaire: Proprietaire;
  initiales: string;
  couleurAvatar: string;
  nombreBiens: number;
  revenus: string;
}

@Component({
  selector: 'app-proprietaire',
  standalone: true,
  imports: [RouterLink, NgFor, NgClass, NgIf, FormsModule],
  templateUrl: './proprietaire.html',
  styleUrls: ['./proprietaire.css']
})
export class ProprietaireComponent implements OnInit {

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private proprietaireService: ProprietaireService,
    private bienService: BienService,
    private authService:AuthService
  ) {}

  proprietaires: Proprietaire[] = [];
  biens: Bien[] = [];
  proprietairesRows: ProprietaireRow[] = [];
  proprietairesFiltres: ProprietaireRow[] = [];
  loading = true;
  erreur  = '';

  stats = { total: 0, biensTotal: 0, revenus: '0', actifs: 0 };

  recherche    = '';
  filtreStatut = '';

  showModal    = false;
  modeModal: 'ajouter' | 'modifier' = 'ajouter';
  propEnCours: Proprietaire = this.propVide();
  propIdEnCours: number | null = null;

  showConfirmSuppr   = false;
  propASupprimer: number | null = null;

  readonly couleurs = [
    '#2563eb','#7c3aed','#0d9488','#ea580c',
    '#16a34a','#dc2626','#0891b2','#d97706'
  ];

  sidebarItems: Array<{label:string;icone:string;route:string;active:boolean;section:string}> = [
    { label:'Tableau de bord', icone:'ti ti-layout-dashboard', route:'/dashboard',    active:false, section:'Principal' },
    { label:'Biens',           icone:'ti ti-building',         route:'/bien',         active:false, section:'Principal' },
    { label:'Locataires',      icone:'ti ti-users',            route:'/locataire',    active:false, section:'Principal' },
    { label:'Contrats',        icone:'ti ti-file-text',        route:'/contrat',      active:false, section:'Principal' },
    { label:'Paiements',       icone:'ti ti-credit-card',      route:'/paiement',     active:false, section:'Principal' },
    { label:'Propriétaires',   icone:'ti ti-user-star',        route:'/proprietaire', active:true,  section:'Gestion'   },
    { label:'Rapports',        icone:'ti ti-chart-bar',        route:'/rapport',      active:false, section:'Gestion'   },
    { label:'Paramètres',      icone:'ti ti-settings',         route:'/parametres',   active:false, section:'Système'   },
  ];

  ngOnInit(): void { this.chargerDonnees(); }

  chargerDonnees(): void {
    this.loading = true;
    forkJoin({
      proprietaires: this.proprietaireService.getProprietaires(),
      biens:         this.bienService.getBiens()
    }).subscribe({
      next: (data: { proprietaires: Proprietaire[]; biens: Bien[] }) => {
        this.proprietaires = data.proprietaires;
        this.biens         = data.biens;
        this.enrichirProprietaires();
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

  private enrichirProprietaires(): void {
    this.proprietairesRows = this.proprietaires.map((p: Proprietaire, i: number) => {
      const biensDuProp = this.biens.filter((b: Bien) => b.proprietaire_nom === p.id);
      const revenus = biensDuProp.reduce((acc: number, b: Bien) => acc + b.loyer_mensuel, 0);
      return {
        proprietaire:  p,
        initiales:     `${p.prenom[0]}${p.nom[0]}`.toUpperCase(),
        couleurAvatar: this.couleurs[i % this.couleurs.length],
        nombreBiens:   biensDuProp.length,
        revenus:       revenus >= 1000000
          ? (revenus / 1000000).toFixed(1) + 'M'
          : revenus.toLocaleString('fr-FR'),
      };
    });
  }

  private calculerStats(): void {
    const totalRevenus = this.biens.reduce((acc: number, b: Bien) => acc + b.loyer_mensuel, 0);
    this.stats = {
      total:      this.proprietaires.length,
      biensTotal: this.biens.length,
      revenus:    totalRevenus >= 1000000
        ? (totalRevenus / 1000000).toFixed(1) + 'M'
        : totalRevenus.toLocaleString('fr-FR'),
      actifs:     this.proprietaires.filter((p: Proprietaire) => p.statut === 'Actif').length,
    };
  }

  appliquerFiltres(): void {
    const q = this.recherche.toLowerCase();
    this.proprietairesFiltres = this.proprietairesRows.filter(r => {
      const p = r.proprietaire;
      const matchQ = !q
        || `${p.prenom} ${p.nom}`.toLowerCase().includes(q)
        || p.email.toLowerCase().includes(q)
        || p.telephone.includes(q);
      const matchS = !this.filtreStatut || p.statut === this.filtreStatut;
      return matchQ && matchS;
    });
  }

  getBadgeClass(statut: string): string {
    return statut === 'Actif' ? 'badge-green' : 'badge-amber';
  }

  ouvrirAjout(): void {
    this.modeModal    = 'ajouter';
    this.propEnCours  = this.propVide();
    this.propIdEnCours = null;
    this.showModal    = true;
  }

  ouvrirModifier(row: ProprietaireRow): void {
    this.modeModal     = 'modifier';
    this.propEnCours   = { ...row.proprietaire };
    this.propIdEnCours = row.proprietaire.id ?? null;
    this.showModal     = true;
  }

  fermerModal(): void { this.showModal = false; }

  soumettre(): void {
    if (this.modeModal === 'ajouter') {
      this.proprietaireService.creerProprietaire(this.propEnCours).subscribe({
        next: () => { this.fermerModal(); this.chargerDonnees(); },
        error: (err: any) => { this.erreur = 'Erreur lors de la création.'; }
      });
    } else if (this.propIdEnCours !== null) {
      this.proprietaireService.modifierProprietaire(this.propIdEnCours, this.propEnCours).subscribe({
        next: () => { this.fermerModal(); this.chargerDonnees(); },
        error: (err: any) => { this.erreur = 'Erreur lors de la modification.'; }
      });
    }
  }

  confirmerSuppression(id: number): void {
    this.propASupprimer   = id;
    this.showConfirmSuppr = true;
  }
  annulerSuppression(): void {
    this.propASupprimer   = null;
    this.showConfirmSuppr = false;
  }
  supprimerConfirme(): void {
    if (this.propASupprimer !== null) {
      this.proprietaireService.supprimerProprietaire(this.propASupprimer).subscribe({
        next: () => { this.showConfirmSuppr = false; this.chargerDonnees(); },
        error: (err: any) => { this.erreur = 'Erreur lors de la suppression.'; }
      });
    }
  }

  setActive(index: number): void {
    this.sidebarItems.forEach((item, i) => item.active = i === index);
  }

  private propVide(): Proprietaire {
    return { nom:'', prenom:'', telephone:'', email:'', statut:'Actif' };
  }
  deconnecter(): void {
  this.authService.logout(); // redirige vers /login automatiquement
}
}