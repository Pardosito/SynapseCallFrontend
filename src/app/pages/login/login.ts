import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize, switchMap } from 'rxjs/operators';
import { PublicFooter } from '../../layouts/public-footer/public-footer';
import { PublicHeader } from '../../layouts/public-header/public-header';
import { LoginForm } from './login-form/login-form';
import { AuthFlowService } from '../../shared/services/auth-flow.service';

@Component({
  selector: 'app-login',
  imports: [PublicHeader, PublicFooter, LoginForm],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  protected loginEmail = '';
  protected loginPassword = '';
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');

  public constructor(protected readonly authFlow: AuthFlowService) {}

  protected submitLogin(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!this.loginEmail || !this.loginPassword) {
      this.errorMessage.set('Debes completar correo y contrasena.');
      return;
    }

    this.isSubmitting.set(true);

    this.authFlow
      .login({
        email: this.loginEmail,
        password_hash: this.loginPassword,
      })
      .pipe(
        switchMap(() => this.authFlow.loadCurrentUser()),
        finalize(() => this.isSubmitting.set(false)),
      )
      .subscribe({
        next: (user) => {
          const label = user?.name || this.loginEmail;
          this.successMessage.set(`Sesion iniciada para ${label}.`);
        },
        error: (error: unknown) => {
          this.errorMessage.set(this.getErrorMessage(error));
        },
      });
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'object' && error.error && 'message' in error.error) {
        return String(error.error.message);
      }

      return `Error ${error.status}: no se pudo iniciar sesion.`;
    }

    return 'No se pudo iniciar sesion.';
  }
}
