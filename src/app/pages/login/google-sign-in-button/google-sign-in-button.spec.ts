import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoogleSignInButton } from './google-sign-in-button';

describe('GoogleSignInButton', () => {
  let component: GoogleSignInButton;
  let fixture: ComponentFixture<GoogleSignInButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoogleSignInButton],
    }).compileComponents();

    fixture = TestBed.createComponent(GoogleSignInButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
