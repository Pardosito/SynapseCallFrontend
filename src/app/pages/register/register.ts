import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize, switchMap } from 'rxjs/operators';
import { PublicFooter } from '../../layouts/public-footer/public-footer';
import { PublicHeader } from '../../layouts/public-header/public-header';
import { RegisterForm } from './register-form/register-form';
import { GoogleSignInButton } from '../login/google-sign-in-button/google-sign-in-button';
import { AuthFlowService } from '../../shared/services/auth-flow.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [PublicHeader, PublicFooter, RegisterForm, GoogleSignInButton],
  templateUrl: './register.html',
  styleUrl: './register.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register {
  private readonly router = inject(Router);
  protected registerName = '';
  protected registerEmail = '';
  protected registerPassword = '';
  protected registerPasswordConfirm = '';
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');

  public constructor(private readonly authFlow: AuthFlowService) {}

  protected submitRegister(): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!this.registerName || !this.registerEmail || !this.registerPassword) {
      this.errorMessage.set('Debes completar nombre, correo y contrasena.');
      return;
    }

    if (this.registerPassword !== this.registerPasswordConfirm) {
      this.errorMessage.set('Las contrasenas no coinciden.');
      return;
    }

    this.isSubmitting.set(true);

    this.authFlow
      .signup({
        name: this.registerName,
        email: this.registerEmail,
        password_hash: this.registerPassword,
      })
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (response) => {
          this.successMessage.set(response.message || 'Cuenta creada con exito.');
        },
        error: (error: unknown) => {
          this.errorMessage.set(this.getErrorMessage(error));
        },
      });
  }

  protected submitGoogleRegister(credential: string): void {
    this.errorMessage.set('');
    this.successMessage.set('');

    this.isSubmitting.set(true);

    this.authFlow
      .googleLogin({ credential })
      .pipe(
        switchMap(() => this.authFlow.loadCurrentUser(true)),
        finalize(() => this.isSubmitting.set(false))
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

      return `Error ${error.status}: no se pudo crear la cuenta.`;
    }

    return 'No se pudo crear la cuenta.';
  }
}
