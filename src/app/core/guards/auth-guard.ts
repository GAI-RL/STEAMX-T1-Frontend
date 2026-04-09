import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is logged in
  if (authService.isLoggedIn()) {
    return true;  // Allow access
  }

  // Not logged in - redirect to login page
  router.navigate(['/login'], { 
    queryParams: { returnUrl: state.url }  // Remember where they tried to go
  });
  return false;  // Block access
};
