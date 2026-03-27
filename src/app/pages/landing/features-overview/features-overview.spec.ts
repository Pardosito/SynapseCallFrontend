import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturesOverview } from './features-overview';

describe('FeaturesOverview', () => {
  let component: FeaturesOverview;
  let fixture: ComponentFixture<FeaturesOverview>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturesOverview],
    }).compileComponents();

    fixture = TestBed.createComponent(FeaturesOverview);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
