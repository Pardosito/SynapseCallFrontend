import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgendaPanel } from './agenda-panel';

describe('AgendaPanel', () => {
  let component: AgendaPanel;
  let fixture: ComponentFixture<AgendaPanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgendaPanel],
    }).compileComponents();

    fixture = TestBed.createComponent(AgendaPanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
