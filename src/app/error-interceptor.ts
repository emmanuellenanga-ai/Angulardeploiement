// src/app/interceptors/error.interceptor.ts
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router     = inject(Router);
  const platformId = inject(PLATFORM_ID);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && isPlatformBrowser(platformId)) {
        // Token expiré ou invalide
        const urlPublique = req.url.includes('/auth/login') ||
                            req.url.includes('/publics/')   ||
                            req.url.includes('/home/stats');

        if (!urlPublique) {
          // Nettoie le localStorage et redirige
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          router.navigate(['/login']);
        }
      }
      return throwError(() => err);
    })
  );
};
