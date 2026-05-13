import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AuthFlowService } from '../../shared/services/auth-flow.service';
import { DashboardHeader } from './dashboard-header';

describe('DashboardHeader', () => {
  let component: DashboardHeader;
  let fixture: ComponentFixture<DashboardHeader>;

  const authFlowMock = {
    logout: () => of(void 0),
    currentUser: () => null
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardHeader],
      providers: [
        provideRouter([]),
        { provide: AuthFlowService, useValue: authFlowMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardHeader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
