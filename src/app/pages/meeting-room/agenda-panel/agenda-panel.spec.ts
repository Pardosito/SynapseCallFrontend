import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AgendaService } from '../../../services/agenda.service';
import { SignalingService } from '../../../services/signaling.service';
import { AgendaPanel } from './agenda-panel';

describe('AgendaPanel', () => {
  let component: AgendaPanel;
  let fixture: ComponentFixture<AgendaPanel>;

  const agendaServiceMock = {
    getAgendaByMeetingId: () => of({ agenda: null, items: [] })
  };
  const signalingServiceMock = {
    onAgendaUpdate: () => of(),
    onAgendaFinished: () => of(),
    onAgendaStopped: () => of(),
    onAgendaItemAdded: () => of(),
    onAgendaItemDeleted: () => of()
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgendaPanel],
      providers: [
        { provide: AgendaService, useValue: agendaServiceMock },
        { provide: SignalingService, useValue: signalingServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AgendaPanel);
    component = fixture.componentInstance;
    
    // Set required inputs before first change detection
    fixture.componentRef.setInput('meetingId', 'test-meeting-id');
    
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
