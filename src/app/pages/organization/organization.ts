import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { OrganizationsService } from '../../services/organizations.service';
import { PaypalCheckout } from './paypal-checkout/paypal-checkout';

@Component({
  selector: 'app-organization',
  imports: [PaypalCheckout],
  templateUrl: './organization.html',
  styleUrl: './organization.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Organization {
  private readonly router = inject(Router);
  private readonly organizationsService = inject(OrganizationsService);

  protected readonly organizationName = signal('');
  protected readonly organizationLogo = signal<File | null>(null);
  protected readonly isSubmitting = signal(false);
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly canShowCheckout = computed(() => this.organizationName().trim().length >= 3);

  protected onLogoSelected(file: File | null): void {
    this.organizationLogo.set(file);
  }

  protected onOrderApproved(orderId: string): void {
    const name = this.organizationName().trim();
    if (!name) {
      this.errorMessage.set('Debes escribir un nombre antes de pagar.');
      return;
    }

    this.errorMessage.set('');
    this.successMessage.set('');
    this.isSubmitting.set(true);

    this.organizationsService
      .createNewOrg(name, orderId, this.organizationLogo() ?? undefined)
      .pipe(finalize(() => this.isSubmitting.set(false)))
      .subscribe({
        next: (response) => {
          this.successMessage.set(response.message || 'Organización creada con éxito.');
          void this.router.navigate(['/dashboard']);
        },
        error: (error: unknown) => {
          this.errorMessage.set(this.getErrorMessage(error));
        },
      });
  }

  protected onCheckoutError(message: string): void {
    this.errorMessage.set(message);
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'object' && error.error && 'message' in error.error) {
        return String(error.error.message);
      }

      return `Error ${error.status}: no se pudo completar el pago.`;
    }

    return 'No se pudo completar el pago.';
  }
}
