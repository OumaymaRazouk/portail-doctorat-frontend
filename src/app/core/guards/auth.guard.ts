import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.accessToken) return true; // ✅ si connecté
  router.navigateByUrl('/login');     // 🔹 redirection sinon
  return false;
};
