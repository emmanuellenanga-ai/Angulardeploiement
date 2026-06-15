import { inject, PLATFORM_ID } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';

export const adminGuard: CanActivateFn = () => {
  const router     = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) return true;

  const token   = localStorage.getItem('access_token');
  const userStr = localStorage.getItem('user');

  console.log('🔴 GUARD token:', !!token);
  console.log('🔴 GUARD userStr:', userStr);

  if (!token || !userStr) {
    console.log('🔴 GUARD → pas de token/user, redirect login');
    router.navigate(['/login']);
    return false;
  }

  let user: any;
  try {
    user = JSON.parse(userStr);
  } catch {
    router.navigate(['/login']);
    return false;
  }

  console.log('🔴 GUARD role:', user?.role);

  if (user?.role !== 'ADMIN') {
    console.log('🔴 GUARD → role pas ADMIN, redirect dashboard');
    router.navigate(['/dashboard']);
    return false;
  }

  console.log('✅ GUARD → accès autorisé');
  return true;
};