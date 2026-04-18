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

  let clonedRequest = req;
  if (token) {
    clonedRequest = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(clonedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        authFlowService.logout();

        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};