import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class MeetingService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  //TODO: Definir como definiremos las llamadas de meetings al backend
}
