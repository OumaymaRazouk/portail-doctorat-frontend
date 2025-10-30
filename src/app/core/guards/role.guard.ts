import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Role } from '../models/auth.models';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const roles = (route.data['roles'] as Role[]) || [];
  const auth = inject(AuthService);
  const router = inject(Router);

  if (roles.length === 0 || auth.hasAnyRole(roles)) return true;
  router.navigateByUrl('/forbidden'); // 🔹 page interdite
  return false;
};
