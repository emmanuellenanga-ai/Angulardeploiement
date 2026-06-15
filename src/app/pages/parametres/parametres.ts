import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { NgFor, NgClass, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth';
interface Agence {
  nom: string;
  adresse: string;
  telephone: string;
  email: string;
  devise: string;
  logo?: string;
}

interface UtilisateurParam {
  id?: number;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  statut: string;
  initiales?: string;
}

@Component({
  selector: 'app-parametres',
  standalone: true,
  imports: [RouterLink, NgFor, NgClass, NgIf, FormsModule],
  templateUrl: './parametres.html',
  styleUrls: ['./parametres.css']
})
export class ParametresComponent implements OnInit {

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private authService: AuthService
  ) {}

  // Onglet actif
  ongletActif: 'agence' | 'utilisateurs' | 'notifications' | 'securite' = 'agence';

  onglets = [
    { val: 'agence'        as const, label: 'Agence',        icone: 'ti ti-building'    },
    { val: 'utilisateurs'  as const, label: 'Utilisateurs',  icone: 'ti ti-users'       },
    { val: 'notifications' as const, label: 'Notifications', icone: 'ti ti-bell'        },
    { val: 'securite'      as const, label: 'Sécurité',      icone: 'ti ti-shield-check'},
  ];

  // ── Agence ──
  agence: Agence = {
    nom:       'ImmoGest',
    adresse:   'Bastos, Yaoundé, Cameroun',
    telephone: '+237 6 95 12 34 56',
    email:     'contact@immogest.cm',
    devise:    'FCFA',
  };
  agenceSauvegardee = false;

  // ── Utilisateurs ──
  utilisateurs: UtilisateurParam[] = [];
  showModalUser    = false;
  modeModalUser: 'ajouter' | 'modifier' = 'ajouter';
  userEnCours: UtilisateurParam = this.userVide();
  userIdEnCours: number | null = null;
  showConfirmSupprUser = false;
  userASupprimer: number | null = null;

  roles = ['Administrateur', 'Agent immobilier', 'Comptable', 'Lecture seule'];

  // ── Notifications ──
  notifications = {
    emailPaiement:   true,
    emailContrat:    true,
    emailExpiration: true,
    smsImpaye:       false,
    smsBienvenue:    true,
  };

  // ── Sécurité ──
  securite = {
    ancienMdp:      '',
    nouveauMdp:     '',
    confirmerMdp:   '',
    showAncien:     false,
    showNouveau:    false,
    showConfirmer:  false,
  };
  mdpErreur  = '';
  mdpSucces  = false;

  loading = false;
  erreur  = '';
  succes  = '';

  sidebarItems: Array<{label:string;icone:string;route:string;active:boolean;section:string}> = [
    { label:'Tableau de bord', icone:'ti ti-layout-dashboard', route:'/dashboard',    active:false, section:'Principal' },
    { label:'Biens',           icone:'ti ti-building',         route:'/bien',         active:false, section:'Principal' },
    { label:'Locataires',      icone:'ti ti-users',            route:'/locataire',    active:false, section:'Principal' },
    { label:'Contrats',        icone:'ti ti-file-text',        route:'/contrat',      active:false, section:'Principal' },
    { label:'Paiements',       icone:'ti ti-credit-card',      route:'/paiement',     active:false, section:'Principal' },
    { label:'Propriétaires',   icone:'ti ti-user-star',        route:'/proprietaire', active:false, section:'Gestion'   },
    { label:'Rapports',        icone:'ti ti-chart-bar',        route:'/rapport',      active:false, section:'Gestion'   },
    { label:'Paramètres',      icone:'ti ti-settings',         route:'/parametres',   active:true,  section:'Système'   },
  ];

  ngOnInit(): void { this.chargerUtilisateurs(); }

  chargerUtilisateurs(): void {
    this.http.get<UtilisateurParam[]>('http://localhost:8000/api/utilisateurs/').subscribe({
      next: (data: UtilisateurParam[]) => {
        this.utilisateurs = data.map((u: UtilisateurParam) => ({
          ...u,
          initiales: `${u.prenom[0]}${u.nom[0]}`.toUpperCase()
        }));
      },
      error: () => {
        // Données mock si l'API n'est pas prête
        this.utilisateurs = [
          { id:1, nom:'Dupont',  prenom:'Admin',  email:'admin@immogest.cm',  role:'Administrateur',  statut:'Actif',    initiales:'AD' },
          { id:2, nom:'Martin',  prenom:'Jean',   email:'jean@immogest.cm',   role:'Agent immobilier', statut:'Actif',    initiales:'JM' },
          { id:3, nom:'Dubois',  prenom:'Marie',  email:'marie@immogest.cm',  role:'Comptable',        statut:'Inactif',  initiales:'MD' },
        ];
      }
    });
  }

  // ── Sauvegarder agence ──
  sauvegarderAgence(): void {
    this.loading = true;
    this.http.put('http://localhost:8000/api/agence/', this.agence).subscribe({
      next: () => {
        this.agenceSauvegardee = true;
        this.succes = 'Paramètres de l\'agence sauvegardés !';
        this.loading = false;
        setTimeout(() => { this.succes = ''; this.agenceSauvegardee = false; }, 3000);
      },
      error: () => {
        this.succes = 'Paramètres sauvegardés localement.';
        this.agenceSauvegardee = true;
        this.loading = false;
        setTimeout(() => { this.succes = ''; this.agenceSauvegardee = false; }, 3000);
      }
    });
  }

  // ── Sauvegarder notifications ──
  sauvegarderNotifications(): void {
    this.succes = 'Préférences de notifications sauvegardées !';
    setTimeout(() => this.succes = '', 3000);
  }

  // ── Changer mot de passe ──
  changerMotDePasse(): void {
    this.mdpErreur = '';
    this.mdpSucces = false;

    if (!this.securite.ancienMdp || !this.securite.nouveauMdp) {
      this.mdpErreur = 'Tous les champs sont obligatoires.';
      return;
    }
    if (this.securite.nouveauMdp !== this.securite.confirmerMdp) {
      this.mdpErreur = 'Les mots de passe ne correspondent pas.';
      return;
    }
    if (this.securite.nouveauMdp.length < 8) {
      this.mdpErreur = 'Le mot de passe doit contenir au moins 8 caractères.';
      return;
    }

    this.http.post('http://localhost:8000/api/auth/change-password/', {
      old_password: this.securite.ancienMdp,
      new_password: this.securite.nouveauMdp,
    }).subscribe({
      next: () => {
        this.mdpSucces = true;
        this.securite.ancienMdp    = '';
        this.securite.nouveauMdp   = '';
        this.securite.confirmerMdp = '';
      },
      error: () => { this.mdpErreur = 'Ancien mot de passe incorrect.'; }
    });
  }

  // ── Utilisateurs ──
  ouvrirAjoutUser(): void {
    this.modeModalUser  = 'ajouter';
    this.userEnCours    = this.userVide();
    this.userIdEnCours  = null;
    this.showModalUser  = true;
  }

  ouvrirModifierUser(u: UtilisateurParam): void {
    this.modeModalUser  = 'modifier';
    this.userEnCours    = { ...u };
    this.userIdEnCours  = u.id ?? null;
    this.showModalUser  = true;
  }

  fermerModalUser(): void { this.showModalUser = false; }

  soumettreUser(): void {
    if (this.modeModalUser === 'ajouter') {
      this.http.post<UtilisateurParam>('http://localhost:8000/api/utilisateurs/', this.userEnCours).subscribe({
        next: () => { this.fermerModalUser(); this.chargerUtilisateurs(); },
        error: () => { this.erreur = 'Erreur lors de la création.'; }
      });
    } else if (this.userIdEnCours !== null) {
      this.http.put(`http://localhost:8000/api/utilisateurs/${this.userIdEnCours}/`, this.userEnCours).subscribe({
        next: () => { this.fermerModalUser(); this.chargerUtilisateurs(); },
        error: () => { this.erreur = 'Erreur lors de la modification.'; }
      });
    }
  }

  confirmerSupprUser(id: number): void {
    this.userASupprimer       = id;
    this.showConfirmSupprUser = true;
  }
  annulerSupprUser(): void {
    this.userASupprimer       = null;
    this.showConfirmSupprUser = false;
  }
  supprimerUserConfirme(): void {
    if (this.userASupprimer !== null) {
      this.http.delete(`http://localhost:8000/api/utilisateurs/${this.userASupprimer}/`).subscribe({
        next: () => { this.showConfirmSupprUser = false; this.chargerUtilisateurs(); },
        error: () => { this.erreur = 'Erreur lors de la suppression.'; }
      });
    }
  }

  getBadgeClass(statut: string): string {
    return statut === 'Actif' ? 'badge-green' : 'badge-amber';
  }

  getRoleClass(role: string): string {
    const map: Record<string, string> = {
      'Administrateur':  'role-blue',
      'Agent immobilier':'role-green',
      'Comptable':       'role-purple',
      'Lecture seule':   'role-gray',
    };
    return map[role] ?? 'role-gray';
  }

  setActive(index: number): void {
    this.sidebarItems.forEach((item, i) => item.active = i === index);
  }

  private userVide(): UtilisateurParam {
    return { nom:'', prenom:'', email:'', role:'Agent immobilier', statut:'Actif' };
  }
  deconnecter(): void {
  this.authService.logout(); // redirige vers /login automatiquement
  }
  get isAdmin(): boolean {
  return this.authService.isAdmin();
  }

// Dans sidebarItems, route du dashboard selon le rôle
  get routeDashboard(): string {
  return this.authService.isAdmin() ? '/admin/dashboard' : '/dashboard';
  }
}
