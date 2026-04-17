import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development'; //TODO: Hay que cambiar a la de prod ya que terminemos el desarrollo
import { IMeeting } from '../shared/models/meeting.model';

@Injectable({
  providedIn: 'root',
})
export class MeetingService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/meetings`;

  createMeeting(meeting: Partial<IMeeting>): Observable<IMeeting> {
    return this.http.post<IMeeting>(this.baseUrl, meeting);
  }

  getMeetings(): Observable<IMeeting[]> {
    return this.http.get<IMeeting[]>(this.baseUrl);
  }

  getMeetingById(id: string): Observable<IMeeting> {
    return this.http.get<IMeeting>(`${this.baseUrl}/${id}`);
  }

  updateMeeting(id: string, meeting: Partial<IMeeting>): Observable<IMeeting> {
    return this.http.put<IMeeting>(`${this.baseUrl}/${id}`, meeting);
  }

  deleteMeeting(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}