import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development'; //TODO: Hay que cambiar a la de prod ya que terminemos el desarrollo
import { IncludeOrgResponse, IOrganization, OrgResponse } from '../shared/models/org.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class OrganizationsService {
  private http = inject(HttpClient);
  private organizationsService = inject(OrganizationsService);
  private baseUrl = `${environment.apiUrl}/orgs`;

  //TODO: Tmb, hay que ver que rollo con las llamadas al backend para toda esta info
  createNewOrg(name: string, orderId: string, logoFile?: File): Observable<IncludeOrgResponse> {
    const formData = new FormData();

    formData.append("name", name);
    formData.append("orderId", orderId);

    if (logoFile) {
      formData.append("file", logoFile);
    }

    return this.http.post<IncludeOrgResponse>(`${this.baseUrl}/create`, formData);
  }

  addMemberToOrg(email: string, orgId: string): Observable<OrgResponse> {
    const payload = {
      email
    }

    return this.http.post<OrgResponse>(`${this.baseUrl}/${orgId}/members`, payload)
  }

  getOrgById(id: string): Observable<OrgResponse> {
    return this.http.get<OrgResponse>(`${this.baseUrl}/${id}`)
  }

  updateOrgById(orgId: string, data: Partial<IOrganization>): Observable<IncludeOrgResponse> {
    return this.http.post<IncludeOrgResponse>(`${this.baseUrl}/${orgId}`, data);
  }

  deleteOrgById(orgId: string): Observable<OrgResponse> {
    return this.http.delete<OrgResponse>(`${this.baseUrl}/${orgId}`);
  }
}
