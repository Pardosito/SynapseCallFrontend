import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { IncludeOrgResponse, IOrganization, OrgResponse } from '../shared/models/org.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrganizationsService {
  private readonly http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/orgs`;

  createNewOrg(name: string, orderId: string, logoFile?: File): Observable<IncludeOrgResponse> {
    const formData = new FormData();

    formData.append('name', name);
    formData.append('orderId', orderId);

    if (logoFile) {
      formData.append('file', logoFile);
    }

    return this.http.post<IncludeOrgResponse>(`${this.baseUrl}/create`, formData, { withCredentials: true });
  }

  addMemberToOrg(email: string, orgId: string): Observable<OrgResponse> {
    const payload = { email };

    return this.http.post<OrgResponse>(`${this.baseUrl}/${orgId}/members`, payload, { withCredentials: true });
  }

  getOrgById(id: string): Observable<OrgResponse> {
    return this.http.get<OrgResponse>(`${this.baseUrl}/${id}`, { withCredentials: true });
  }

  updateOrgById(orgId: string, data: Partial<IOrganization>): Observable<IncludeOrgResponse> {
    return this.http.patch<IncludeOrgResponse>(`${this.baseUrl}/${orgId}`, data, { withCredentials: true });
  }

  deleteOrgById(orgId: string): Observable<OrgResponse> {
    return this.http.delete<OrgResponse>(`${this.baseUrl}/${orgId}`, { withCredentials: true });
  }
}
