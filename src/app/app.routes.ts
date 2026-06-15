import { Routes } from '@angular/router';
import { ComponentRef } from '@angular/core';
import {authGuard} from './auth-guard';
import {adminGuard} from './admin-guard';

import {HomeComponent} from './pages/home/home';
import {LoginComponent} from './pages/login/login';
import { BiensPublicsComponent } from './pages/biens-publics/biens-publics';
import { BiensDetailsComponent } from './pages/biens-details/biens-details';
import {DashboardComponent} from './pages/dashboard/dashboard';

import {BienComponent} from './pages/bien/bien';
import {LocataireComponent} from './pages/locataire/locataire';
import {PaiementComponent} from './pages/paiement/paiement';
import { ContratComponent } from './pages/contrat/contrat';
import { RapportComponent } from './pages/rapport/rapport';
import { ProprietaireComponent } from './pages/proprietaire/proprietaire';
import { ParametresComponent } from './pages/parametres/parametres';
import { AProposComponent } from './pages/apropos/apropos'; 
import { ContactComponent } from './pages/contact/contact';
import { ServicesComponent } from './pages/services/services';
import { DemandeVisiteComponent } from './pages/demande-visite/demande-visite';
import { AdminDemandesComponent } from './pages/admin-demandes/admin-demandes';
import { AdminBiensComponent } from './pages/admin-biens/admin-biens';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard';
import { AdminProprietaireComponent } from './pages/admin-proprietaire/admin-proprietaire';
import { AdminUtilisateursComponent } from './pages/admin-utilisateurs/admin-utilisateurs';
export const routes: Routes = [
    {
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate:[authGuard]
    },
    { path: 'demandes-visite', component: DemandeVisiteComponent, canActivate: [authGuard] },
    {
    path: '', 
    component: HomeComponent
    },

    { path: 'admin/dashboard', component: AdminDashboardComponent, canActivate: [adminGuard] },
    { path: 'admin/biens', component: AdminBiensComponent, canActivate: [adminGuard] },
    { path: 'admin/demandes', component: AdminDemandesComponent, canActivate: [adminGuard] },
    { path: 'admin/proprietaire', component: AdminProprietaireComponent, canActivate: [adminGuard] },
    { path: 'admin/utilisateurs', component: AdminUtilisateursComponent, canActivate: [adminGuard] },

    { path: 'biens-publics',      component: BiensPublicsComponent },
  
  { path: 'biens-publics/:id',  component: BiensDetailsComponent   },

    {
    path: 'login', 
    component: LoginComponent
    },

    {path:'bien', component: BienComponent, canActivate:[authGuard]},

    {path:'locataire', component: LocataireComponent, canActivate:[authGuard]},

    {path : 'paiement', component:PaiementComponent,canActivate:[authGuard]},
    
    {path:'contrat', component:ContratComponent,canActivate:[authGuard]},


    {path:'rapport', component:RapportComponent,canActivate:[authGuard]},

    {path:'proprietaire', component:ProprietaireComponent,canActivate:[authGuard]},

    {path:'parametres', component:ParametresComponent,canActivate:[authGuard]},

    {path:'apropos', component: AProposComponent},

    {path:'services', component:ServicesComponent},

    {path:'contact', component:ContactComponent},


    {path:'**', redirectTo:''}

];
