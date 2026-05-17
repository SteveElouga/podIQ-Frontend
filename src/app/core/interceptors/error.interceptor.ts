import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { MessageService } from 'primeng/api';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const messages = inject(MessageService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        auth.logout();
      } else if (err.status === 0) {
        messages.add({
          severity: 'error',
          summary: 'Network Error',
          detail: 'Cannot reach the server. Check your connection.',
          life: 6000,
        });
      } else if (err.status >= 500) {
        messages.add({
          severity: 'error',
          summary: 'Server Error',
          detail: `Unexpected error (${err.status}). Please try again.`,
          life: 6000,
        });
      }
      return throwError(() => err);
    })
  );
};
