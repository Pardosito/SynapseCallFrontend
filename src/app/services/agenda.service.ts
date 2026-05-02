import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';
import { Observable } from 'rxjs';
import { IAgenda } from '../shared/models/agenda.model';
import { IAgendaItem } from '../shared/models/agenda-item.model';

export interface IAgendaResponse {
  agenda?: IAgenda;
  items: IAgendaItem[];
}

@Injectable({
  providedIn: 'root',
})
export class AgendaService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/meetings`;

  getAgendaByMeetingId(meetingId: string): Observable<IAgendaResponse> {
    return this.http.get<IAgendaResponse>(`${this.baseUrl}/${meetingId}/agenda`);
  }

  upsertAgenda(meetingId: string, agenda: Partial<IAgenda>): Observable<IAgenda> {
    return this.http.post<IAgenda>(`${this.baseUrl}/${meetingId}/agenda`, agenda);
  }

  addAgendaItem(meetingId: string, item: { topic: string; durationInMinutes: number; order: number }): Observable<IAgendaItem> {
    return this.http.post<IAgendaItem>(`${this.baseUrl}/${meetingId}/agenda/items`, item);
  }

  updateAgendaItem(itemId: string, updates: Partial<IAgendaItem>): Observable<IAgendaItem> {
    return this.http.patch<IAgendaItem>(`${this.baseUrl}/agenda/items/${itemId}`, updates);
  }

  deleteAgendaItem(itemId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/agenda/items/${itemId}`);
  }
}
