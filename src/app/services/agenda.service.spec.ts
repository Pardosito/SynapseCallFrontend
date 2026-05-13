import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AgendaService } from './agenda.service';
import { environment } from '../../environments/environment.development';

describe('AgendaService', () => {
  let service: AgendaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AgendaService],
    });
    service = TestBed.inject(AgendaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get agenda by meeting id', () => {
    const mockAgenda = {
      agenda: { id: 'a1', meeting_id: 'm1' },
      items: [{ id: 'i1', topic: 'Intro', status: 'pending' }]
    };

    service.getAgendaByMeetingId('m1').subscribe((res: any) => {
      expect(res.items.length).toBe(1);
      expect(res.items[0].topic).toBe('Intro');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/meetings/m1/agenda`);
    expect(req.request.method).toBe('GET');
    req.flush(mockAgenda);
  });
});
