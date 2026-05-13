import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OrganizationsService } from './organizations.service';
import { environment } from '../../environments/environment';

describe('OrganizationsService', () => {
  let service: OrganizationsService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [OrganizationsService],
    });
    service = TestBed.inject(OrganizationsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get organization by id', () => {
    const mockOrg = {
      organization: {
        id: '123',
        name: 'Test Org',
        members: []
      }
    };

    service.getOrgById('123').subscribe((res: any) => {
      expect(res.organization.name).toBe('Test Org');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/orgs/123`);
    expect(req.request.method).toBe('GET');
    req.flush(mockOrg);
  });

  it('should add member to org', () => {
    const mockResponse = { message: 'Usuario agregado exitosamente.' };
    const email = 'test@example.com';
    const orgId = '123';

    service.addMemberToOrg(email, orgId).subscribe((res: any) => {
      expect(res.message).toBe('Usuario agregado exitosamente.');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/orgs/${orgId}/members`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email });
    req.flush(mockResponse);
  });
});
