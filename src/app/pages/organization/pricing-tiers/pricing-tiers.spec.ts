import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PricingTiers } from './pricing-tiers';

describe('PricingTiers', () => {
  let component: PricingTiers;
  let fixture: ComponentFixture<PricingTiers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PricingTiers],
    }).compileComponents();

    fixture = TestBed.createComponent(PricingTiers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
