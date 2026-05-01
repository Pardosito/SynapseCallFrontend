import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize, switchMap } from 'rxjs/operators';
import { PublicFooter } from '../../layouts/public-footer/public-footer';
import { PublicHeader } from '../../layouts/public-header/public-header';
import { LoginForm } from './login-form/login-form';
import { GoogleSignInButton } from './google-sign-in-button/google-sign-in-button';
import { AuthFlowService } from '../../shared/services/auth-flow.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [PublicHeader, PublicFooter, LoginForm, GoogleSignInButton],
  templateUrl: './login.html',
  styleUrl: './login.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private router = inject(Router);
  protected loginEmail = signal("");
  protected loginPassword = signal("");
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');

  public constructor(protected readonly authFlow: AuthFlowService) {}

  protected submitLogin(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!this.loginEmail() || !this.loginPassword()) {
      this.errorMessage.set('Debes completar correo y contrasena.');
      return;
    }

    this.isSubmitting.set(true);

    this.authFlow
      .login({
        email: this.loginEmail(),
        password_hash: this.loginPassword(),
      })
      .pipe(
        switchMap(() => this.authFlow.loadCurrentUser()),
        finalize(() => this.isSubmitting.set(false)),
      )
      .subscribe({
        next: (user) => {
          const label = user?.name || this.loginEmail();
          this.successMessage.set(`Sesion iniciada para ${label}. Redirigiendo...`);
          this.router.navigate(['/dashboard']);
        },
        error: (error: unknown) => {
          this.errorMessage.set(this.getErrorMessage(error));
        },
      });
  }

  protected submitGoogleLogin(credential: string): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    this.isSubmitting.set(true);

    this.authFlow
      .googleLogin({ credential })
      .pipe(
        switchMap(() => this.authFlow.loadCurrentUser(true)),
        finalize(() => this.isSubmitting.set(false)),
      )
      .subscribe({
        next: (user) => {
          const label = user?.name || user?.email || 'tu cuenta';
          this.successMessage.set(`Sesion iniciada para ${label}. Redirigiendo...`);
          void this.router.navigate(['/dashboard']);
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
