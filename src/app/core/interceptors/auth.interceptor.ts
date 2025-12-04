import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Ne pas ajouter d'Authorization pour les envois FormData (uploads)
  const isFormData = typeof FormData !== 'undefined' && (req as any).body instanceof FormData;
  const auth = inject(AuthService);
  const token = auth.accessToken;
  const cloned = (token && !isFormData)
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(cloned).pipe(
    catchError((err: HttpErrorResponse): any => {
      if (err.status === 401 && auth.refreshToken) {
        return auth.refresh(auth.refreshToken).pipe(
          switchMap((res: any) => {
            auth.saveTokens(res);
            const retried = req.clone({ setHeaders: { Authorization: `Bearer ${res.accessToken}` } });
            return next(retried) as any;
          })
        );
      }
      return throwError(() => err);
    })
  ) as any;
};
