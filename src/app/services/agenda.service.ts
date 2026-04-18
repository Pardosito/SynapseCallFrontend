import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { IAgenda } from '../shared/models/agenda.model';

@Injectable({
  providedIn: 'root',
})
export class AgendaService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/meetings`;

  getAgendaByMeetingId(meetingId: string): Observable<IAgenda> {
    return this.http.get<IAgenda>(`${this.baseUrl}/${meetingId}/agenda`);
  }

  upsertAgenda(meetingId: string, agenda: Partial<IAgenda>): Observable<IAgenda> {
    return this.http.post<IAgenda>(`${this.baseUrl}/${meetingId}/agenda`, agenda);
  }
}