import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser,NgFor, NgIf  } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {AuthService} from '../../services/auth';
import {Router} from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  imports: [RouterLink, FormsModule, NgFor, NgIf],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  [x: string]: any;
  constructor(
    private authService: AuthService,
    private router: Router,
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  email: string = '';
  motDePasse: string = '';
  sesouvenir: boolean = false;
  showPassword: boolean = false;
  erreur: string = '';
  loading: boolean = false;

  togglePassword(): void {
    this.showPassword = !this.motDePasse;
  }

  onLogin(): void{
    if(!this.email || !this.motDePasse){
      this.erreur = 'veuillez remplir tous les champs';
      return;
    }
    if(!this.email.includes('@')){
      this.erreur = 'Adresse email invalide';
      return;
    }
    this.erreur = '';
    this.loading = true;

    this.authService.login(this.email, this.motDePasse).subscribe({
    next: (response: any) => {
    console.log(' Réponse login:', response);
    console.log('Token sauvegardé:', localStorage.getItem('access_token'));
    if (this.authService.isAdmin()) {
      this.router.navigate(['/admin/dashboard']); // temporairement /dashboard, /admin/dashboard n'existe pas encore
    } else {
      this.router.navigate(['/dashboard']);
    }
    
    this.loading = false;
    },
    error: () => {
      this.loading = false;
      this.erreur  = 'Email ou mot de passe incorrect.';
    }
   });

  }
}
