import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface LoginResponse {
  access:  string;   // JWT access token
  refresh: string;   // JWT refresh token
  user?: {
    id:    number;
    email: string;
    nom:   string;
    prenom: string;
    role:  'ADMIN'| 'PROPRIETAIRE';
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  // ── Login → appel Django JWT ──
  login(identifiant: string, password: string): Observable<LoginResponse> {

    
    return this.http.post<LoginResponse>(
      `${environment.apiUrl}/auth/login/`,
      {username: identifiant, password: password}

    ).pipe(
      tap((res: LoginResponse) => {
        if (isPlatformBrowser(this.platformId)) {
          // Sauvegarde les tokens en localStorage
          localStorage.setItem('access_token',  res.access);
          localStorage.setItem('refresh_token', res.refresh);
          if(res.user){
            localStorage.setItem('user', JSON.stringify(res.user));
          }
          this.router.navigate(['/Dashboard']);
          
        }
      })
    );
  }

  // ── Déconnexion ──
  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
    }
    this.router.navigate(['/login']);
  }

  // ── Vérifie si connecté ──
  isConnecte(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return !!localStorage.getItem('access_token');
  }

  // ── Récupère l'utilisateur connecté ──
  getUser(): { id: number; email: string; nom: string; prenom: string; role: string } | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    const u = localStorage.getItem('user');
    return u ? JSON.parse(u) : null;
  }

  // ── Récupère le token ──
  getToken(): string | null {
    if (!isPlatformBrowser(this.platformId)) return null;
    return localStorage.getItem('access_token');
  }

  //recupere le role de l'utilisateur
  getRole(): 'ADMIN' | 'PROPRIETAIRE' | null {
   const user = this.getUser();
    return (user?.role as 'ADMIN' | 'PROPRIETAIRE') ?? null;
  }

  isAdmin(): boolean {
  return this.getRole() === 'ADMIN';
  }
}