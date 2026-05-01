import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, computed, input, output, signal, viewChild } from '@angular/core';
import { loadScript } from '@paypal/paypal-js';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-paypal-checkout',
  imports: [],
  templateUrl: './paypal-checkout.html',
  styleUrl: './paypal-checkout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaypalCheckout implements AfterViewInit {
  readonly organizationName = input('');
  readonly amount = input('5.00');
  readonly currency = input('USD');
  readonly disabled = input(false);
  readonly orderApproved = output<string>();
  readonly paymentError = output<string>();
  protected readonly isLoading = signal(false);
  protected readonly isReady = signal(false);
  protected readonly hasClientId = computed(() => !!environment.paypalClientId);
  private readonly checkoutHost = viewChild<ElementRef<HTMLDivElement>>('checkoutHost');

  public async ngAfterViewInit(): Promise<void> {
    if (!environment.paypalClientId) {
      return;
    }

    await this.renderButtons();
  }

  private async renderButtons(): Promise<void> {
    const host = this.checkoutHost()?.nativeElement;
    if (!host) {
      return;
    }

    this.isLoading.set(true);

    try {
      const paypal = await loadScript({
        clientId: environment.paypalClientId,
        currency: this.currency(),
        intent: 'capture',
      });

      if (!paypal) {
        this.paymentError.emit('No se pudo cargar PayPal.');
        return;
      }

      const paypalButtons = paypal.Buttons?.({
        style: {
          layout: 'vertical',
          shape: 'pill',
          label: 'paypal',
        },
        createOrder: (_data, actions) => {
          if (!actions.order) {
            this.paymentError.emit('No se pudo preparar la orden de PayPal.');
            return Promise.reject(new Error('PayPal order actions unavailable'));
          }

          const title = this.organizationName().trim() || 'SynapseCall organization plan';
          return actions.order.create({
            intent: 'CAPTURE',
            purchase_units: [
              {
                amount: {
                  value: this.amount(),
                  currency_code: this.currency(),
                },
                description: title,
              },
            ],
          });
        },
        onApprove: async (data) => {
          if (!data.orderID) {
            this.paymentError.emit('No se recibió el identificador del pago.');
            return;
          }

          this.orderApproved.emit(data.orderID);
        },
        onCancel: () => {
          this.paymentError.emit('Pago cancelado.');
        },
        onError: () => {
          this.paymentError.emit('No se pudo completar el pago con PayPal.');
        },
      });

      if (!paypalButtons) {
        this.paymentError.emit('No se pudo inicializar PayPal.');
        return;
      }

      await paypalButtons.render(host);

      this.isReady.set(true);
    } catch {
      this.paymentError.emit('No se pudo inicializar PayPal.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
