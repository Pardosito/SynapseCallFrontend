import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthFlowService } from '../services/auth-flow.service';
import { Router } from '@angular/router';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authFlowService = inject(AuthFlowService);
  const router = inject(Router)
  const token = authFlowService.accessToken();

  console.log('Interceptando petición a:', req.url);
  console.log('Token disponible:', token ? 'Sí hay token' : 'NO HAY TOKEN');

  let clonedRequest = req;
  if (token) {
    clonedRequest = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      const isLogoutRequest = req.url.includes('/auth/logout');

      if (error.status === 401 && token && !isLogoutRequest) {
        authFlowService.logout().subscribe({
          complete: () => void router.navigate(['/login']),
        });
      }

      return throwError(() => error);
    })
  );
};