import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { filter, map, take } from 'rxjs';

/**
 * Functional Route Guard for protecting Blog Admin routes
 */
export const blogAdminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isLoaded$.pipe(
    filter((isLoaded) => isLoaded),
    take(1),
    map(() => {
      if (authService.isAuthenticated) {
        return true;
      }
      // Redirect unauthenticated visitors back to blog listing
      router.navigate(['/blog']);
      return false;
    })
  );
};
