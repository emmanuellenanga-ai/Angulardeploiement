import { Component, OnInit } from '@angular/core';
import { NgFor, NgClass, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminProprietaireService, ProprietaireAdmin } from '../../services/admin-proprietaire';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-admin-proprietaire',
  standalone: true,
  imports: [RouterLink, NgFor, NgClass, NgIf, FormsModule],
  templateUrl: './admin-proprietaire.html',
  styleUrls: ['./admin-proprietaire.css']
})
export class AdminProprietaireComponent implements OnInit {

  constructor(
    private propService: AdminProprietaireService,
    private authService: AuthService
  ) {}

  proprietaires: ProprietaireAdmin[] = [];
  proprietairesFiltres: ProprietaireAdmin[] = [];
  loading = true;
  erreur  = '';

  recherche = '';
  filtreStatut = '';

  showModal = false;
  modeModal: 'ajouter' | 'modifier' = 'ajouter';
  propEnCours: ProprietaireAdmin = this.propVide();
  propIdEnCours: number | null = null;

  showConfirmSuppr = false;
  propASupprimer: number | null = null;

  stats = { total: 0, actifs: 0, inactifs: 0 };

  sidebarItems: Array<{label:string;icone:string;route:string;active:boolean;section:string;badge?:string|null}> = [
    { label:'Tableau de bord', icone:'ti ti-layout-dashboard', route:'/admin/dashboard',     active:false, section:'Administration' },
    { label:'Propriétaires',   icone:'ti ti-users',            route:'/admin/proprietaire', active:true,  section:'Administration' },
    { label:'Tous les biens',  icone:'ti ti-building',         route:'/admin/biens',         active:false, section:'Administration' },
    { label:'Demandes visite', icone:'ti ti-calendar-event',   route:'/admin/demandes',      active:false, section:'Administration' },
    { label:'Utilisateurs',    icone:'ti ti-user-cog',         route:'/admin/utilisateurs',  active:false, section:'Système' },
    { label:'Paramètres',      icone:'ti ti-settings',         route:'/parametres',          active:false, section:'Système' },
  ];

  ngOnInit(): void {
    this.charger();
  }

  charger(): void {
    this.loading = true;
    this.propService.getProprietaires().subscribe({
      next: (data: ProprietaireAdmin[]) => {
        // Ne garde que les AGENT (propriétaires) — exclut les ADMIN
        this.proprietaires = data.filter((p: ProprietaireAdmin) => p.role === 'PROPRIETAIRE');
        this.calculerStats();
        this.appliquerFiltres();
        this.loading = false;
      },
      error: (err: any) => {
        this.erreur  = 'Impossible de charger les propriétaires.';
        this.loading = false;
      }
    });
  }

  calculerStats(): void {
    this.stats.total   = this.proprietaires.length;
    this.stats.actifs  = this.proprietaires.filter((p: ProprietaireAdmin) => p.is_active).length;
    this.stats.inactifs = this.proprietaires.filter((p: ProprietaireAdmin) => !p.is_active).length;
  }

  appliquerFiltres(): void {
    const q = this.recherche.toLowerCase();
    this.proprietairesFiltres = this.proprietaires.filter((p: ProprietaireAdmin) => {
      const matchQ = !q
        || `${p.first_name} ${p.last_name}`.toLowerCase().includes(q)
        || p.email.toLowerCase().includes(q)
        || p.username.toLowerCase().includes(q);
      const matchS = !this.filtreStatut
        || (this.filtreStatut === 'actif' && p.is_active)
        || (this.filtreStatut === 'inactif' && !p.is_active);
      return matchQ && matchS;
    });
  }

  getInitiales(p: ProprietaireAdmin): string {
    const prenom = p.first_name?.[0] ?? p.username[0];
    const nom    = p.last_name?.[0]  ?? '';
    return (prenom + nom).toUpperCase();
  }

  ouvrirAjout(): void {
    this.modeModal     = 'ajouter';
    this.propEnCours   = this.propVide();
    this.propIdEnCours = null;
    this.showModal     = true;
  }

  ouvrirModifier(p: ProprietaireAdmin): void {
    this.modeModal     = 'modifier';
    this.propEnCours   = { ...p, password: '' };
    this.propIdEnCours = p.id ?? null;
    this.showModal     = true;
  }

  fermerModal(): void { this.showModal = false; }

  soumettre(): void {
    if (this.modeModal === 'ajouter') {
      this.propService.creerProprietaire(this.propEnCours).subscribe({
        next: () => { this.fermerModal(); this.charger(); },
        error: (err: any) => { this.erreur = 'Erreur lors de la création. Vérifiez les champs.'; }
      });
    } else if (this.propIdEnCours !== null) {
      // Ne pas envoyer un mot de passe vide lors de la modification
      const payload = { ...this.propEnCours };
      if (!payload.password) delete payload.password;

      this.propService.modifierProprietaire(this.propIdEnCours, payload).subscribe({
        next: () => { this.fermerModal(); this.charger(); },
        error: (err: any) => { this.erreur = 'Erreur lors de la modification.'; }
      });
    }
  }

  toggleActif(p: ProprietaireAdmin): void {
    if (!p.id) return;
    this.propService.toggleActif(p.id, !p.is_active).subscribe({
      next: () => this.charger(),
      error: () => { this.erreur = 'Erreur lors de la mise à jour du statut.'; }
    });
  }

  confirmerSuppression(id: number): void {
    this.propASupprimer  = id;
    this.showConfirmSuppr = true;
  }
  annulerSuppression(): void {
    this.propASupprimer  = null;
    this.showConfirmSuppr = false;
  }
  supprimerConfirme(): void {
    if (this.propASupprimer !== null) {
      this.propService.supprimerProprietaire(this.propASupprimer).subscribe({
        next: () => { this.showConfirmSuppr = false; this.charger(); },
        error: () => { this.erreur = 'Erreur lors de la suppression.'; }
      });
    }
  }

  setActive(index: number): void {
    this.sidebarItems.forEach((item, i) => item.active = i === index);
  }

  deconnecter(): void {
    this.authService.logout();
  }

  private propVide(): ProprietaireAdmin {
    return {
      username: '', email: '', first_name: '', last_name: '',
      telephone: '', role: 'PROPRIETAIRE', is_active: true, password: ''
    };
  }
}