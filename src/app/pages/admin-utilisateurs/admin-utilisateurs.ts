import { Component, OnInit } from '@angular/core';
import { NgFor, NgClass, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminProprietaireService, ProprietaireAdmin } from '../../services/admin-proprietaire';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-admin-utilisateurs',
  standalone: true,
  imports: [RouterLink, NgFor, NgClass, NgIf, FormsModule],
  templateUrl: './admin-utilisateurs.html',
  styleUrls: ['./admin-utilisateurs.css']
})
export class AdminUtilisateursComponent implements OnInit {

  constructor(
    private userService: AdminProprietaireService,
    private authService: AuthService
  ) {}

  utilisateurs: ProprietaireAdmin[] = [];
  utilisateursFiltres: ProprietaireAdmin[] = [];
  loading = true;
  erreur  = '';

  recherche    = '';
  filtreRole   = '';

  showModal = false;
  modeModal: 'ajouter' | 'modifier' = 'ajouter';
  userEnCours: ProprietaireAdmin = this.userVide();
  userIdEnCours: number | null = null;

  showConfirmSuppr = false;
  userASupprimer: number | null = null;

  monId: number | null = null; // empêche l'admin de se supprimer/désactiver lui-même

  sidebarItems: Array<{label:string;icone:string;route:string;active:boolean;section:string;badge?:string|null}> = [
    { label:'Tableau de bord', icone:'ti ti-layout-dashboard', route:'/admin/dashboard',     active:false, section:'Administration' },
    { label:'Propriétaires',   icone:'ti ti-users',            route:'/admin/proprietaires', active:false, section:'Administration' },
    { label:'Tous les biens',  icone:'ti ti-building',         route:'/admin/biens',         active:false, section:'Administration' },
    { label:'Demandes visite', icone:'ti ti-calendar-event',   route:'/admin/demandes',      active:false, section:'Administration' },
    { label:'Utilisateurs',    icone:'ti ti-user-cog',         route:'/admin/utilisateurs',  active:true,  section:'Système' },
    { label:'Paramètres',      icone:'ti ti-settings',         route:'/parametres',          active:false, section:'Système' },
  ];

  ngOnInit(): void {
    this.monId = this.authService.getUser()?.id ?? null;
    this.charger();
  }

  charger(): void {
    this.loading = true;
    this.userService.getProprietaires().subscribe({
      next: (data: ProprietaireAdmin[]) => {
        this.utilisateurs = data;
        this.appliquerFiltres();
        this.loading = false;
      },
      error: (err: any) => {
        this.erreur  = 'Impossible de charger les utilisateurs.';
        this.loading = false;
      }
    });
  }

  appliquerFiltres(): void {
    const q = this.recherche.toLowerCase();
    this.utilisateursFiltres = this.utilisateurs.filter((u: ProprietaireAdmin) => {
      const matchQ = !q
        || `${u.first_name} ${u.last_name}`.toLowerCase().includes(q)
        || u.email.toLowerCase().includes(q)
        || u.username.toLowerCase().includes(q);
      const matchR = !this.filtreRole || u.role === this.filtreRole;
      return matchQ && matchR;
    });
  }

  getInitiales(u: ProprietaireAdmin): string {
    const prenom = u.first_name?.[0] ?? u.username[0];
    const nom    = u.last_name?.[0]  ?? '';
    return (prenom + nom).toUpperCase();
  }

  getRoleClass(role: string): string {
    return role === 'ADMIN' ? 'role-purple' : 'role-blue';
  }
  getRoleLabel(role: string): string {
    return role === 'ADMIN' ? 'Administrateur' : 'Agent immobilier';
  }

  ouvrirAjout(): void {
    this.modeModal     = 'ajouter';
    this.userEnCours   = this.userVide();
    this.userIdEnCours = null;
    this.showModal     = true;
  }

  ouvrirModifier(u: ProprietaireAdmin): void {
    this.modeModal     = 'modifier';
    this.userEnCours   = { ...u, password: '' };
    this.userIdEnCours = u.id ?? null;
    this.showModal     = true;
  }

  fermerModal(): void { this.showModal = false; }

  soumettre(): void {
    if (this.modeModal === 'ajouter') {
      this.userService.creerProprietaire(this.userEnCours).subscribe({
        next: () => { this.fermerModal(); this.charger(); },
        error: () => { this.erreur = 'Erreur lors de la création.'; }
      });
    } else if (this.userIdEnCours !== null) {
      const payload = { ...this.userEnCours };
      if (!payload.password) delete payload.password;
      this.userService.modifierProprietaire(this.userIdEnCours, payload).subscribe({
        next: () => { this.fermerModal(); this.charger(); },
        error: () => { this.erreur = 'Erreur lors de la modification.'; }
      });
    }
  }

  toggleActif(u: ProprietaireAdmin): void {
    if (!u.id || u.id === this.monId) return;
    this.userService.toggleActif(u.id, !u.is_active).subscribe({
      next: () => this.charger(),
      error: () => { this.erreur = 'Erreur lors de la mise à jour.'; }
    });
  }

  confirmerSuppression(id: number): void {
    if (id === this.monId) return;
    this.userASupprimer  = id;
    this.showConfirmSuppr = true;
  }
  annulerSuppression(): void {
    this.userASupprimer  = null;
    this.showConfirmSuppr = false;
  }
  supprimerConfirme(): void {
    if (this.userASupprimer !== null) {
      this.userService.supprimerProprietaire(this.userASupprimer).subscribe({
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

  private userVide(): ProprietaireAdmin {
    return {
      username: '', email: '', first_name: '', last_name: '',
      telephone: '', role: 'PROPRIETAIRE', is_active: true, password: ''
    };
  }
}
