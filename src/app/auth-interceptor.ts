import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../environments/environment';

// URLs qui ne nécessitent PAS de token
const URLS_PUBLIQUES = [
  '/api/auth/login/',
  '/api/auth/refresh/',
  '/api/biens/publics/',
  '/api/home/stats/',
  '/api/demandes-visite/',   // POST public (visiteur)
  '/api/contact/',
];

// Vérifie si une URL est publique
function estPublique(url: string): boolean {
  // Méthode GET sur /api/bien/ est publique (liste biens)
  return URLS_PUBLIQUES.some(u => url.includes(u));
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  // SSR : pas de localStorage
  if (!isPlatformBrowser(platformId)) return next(req);

  const token = localStorage.getItem('access_token');

  // Pas de token → on envoie la requête sans modification
  if (!token) return next(req);

  // URL publique → on n'ajoute pas le token
  if (estPublique(req.url)) return next(req);

  // URL privée → on ajoute le token
  const authReq = req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`
    }
  });
  return next(authReq);
};