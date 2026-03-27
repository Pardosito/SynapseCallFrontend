import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaypalCheckout } from './paypal-checkout';

describe('PaypalCheckout', () => {
  let component: PaypalCheckout;
  let fixture: ComponentFixture<PaypalCheckout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaypalCheckout],
    }).compileComponents();

    fixture = TestBed.createComponent(PaypalCheckout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
