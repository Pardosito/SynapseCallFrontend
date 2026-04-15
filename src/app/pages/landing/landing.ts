import { ChangeDetectionStrategy, Component, OnInit, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, finalize, of } from 'rxjs';
import { PublicHeader } from '../../layouts/public-header/public-header';
import { PublicFooter } from '../../layouts/public-footer/public-footer';
import { FeaturesOverview } from './features-overview/features-overview';
import { HeroSection } from './hero-section/hero-section';
import { AuthFlowService } from '../../shared/services/auth-flow.service';

@Component({
  selector: 'app-landing',
  imports: [PublicHeader, HeroSection, FeaturesOverview, PublicFooter],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Landing implements OnInit {
  protected readonly isLoadingProfile = signal(false);
  protected readonly feedback = signal('');

  public constructor(protected readonly authFlow: AuthFlowService) {}

  public ngOnInit(): void {
    this.loadProfile();
  }

  protected loadProfile(force = false): void {
    this.isLoadingProfile.set(true);
    this.feedback.set('');

    this.authFlow
      .loadCurrentUser(force)
      .pipe(
        catchError((error: unknown) => {
          const message = this.getErrorMessage(error);
          this.feedback.set(message);
          return of(null);
        }),
        finalize(() => this.isLoadingProfile.set(false)),
      )
      .subscribe((user) => {
        if (user) {
          this.feedback.set('Perfil cargado desde flujo de cache compartido.');
          return;
        }

        if (!this.feedback()) {
          this.feedback.set('Sin sesion activa. Inicia sesion o crea una cuenta.');
        }
      });
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 401 || error.status === 403) {
        return 'Sin sesion activa. Inicia sesion o crea una cuenta.';
      }

      if (typeof error.error === 'object' && error.error && 'message' in error.error) {
        return String(error.error.message);
      }
    }

    return 'No fue posible cargar el perfil.';
  }
}
