import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { MeetingService } from '../../services/meeting.service';
import { SignalingService } from '../../services/signaling.service';
import { AuthFlowService } from '../../shared/services/auth-flow.service';
import { MeetingRoom } from './meeting-room';

describe('MeetingRoom', () => {
  let component: MeetingRoom;
  let fixture: ComponentFixture<MeetingRoom>;

  const authFlowMock = { currentUser: () => null };
  const meetingServiceMock = { getMeetingById: () => of({ meeting: {}, config: {} }) };
  const signalingServiceMock = { 
    connect: () => {}, 
    joinRoom: () => {},
    onMessageReceived: () => of(),
    onFileUploaded: () => of(),
    disconnect: () => {}
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MeetingRoom],
      providers: [
        provideRouter([]),
        { provide: AuthFlowService, useValue: authFlowMock },
        { provide: MeetingService, useValue: meetingServiceMock },
        { provide: SignalingService, useValue: signalingServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MeetingRoom);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
