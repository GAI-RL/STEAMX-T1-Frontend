import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guest Guard - Prevents authenticated users from accessing login/register pages
 * If user is logged in, redirects to dashboard
 * If user is not logged in, allows access to login/register
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated
  const isAuthenticated = authService.isLoggedIn();

  if (isAuthenticated) {
    // User is logged in, redirect to dashboard
    console.log('🔒 Guest Guard: User is authenticated, redirecting to dashboard');
    router.navigate(['/chat']);
    return false;
  }

  // User is not logged in, allow access to login/register
  console.log('✅ Guest Guard: User is not authenticated, allowing access');
  return true;
};