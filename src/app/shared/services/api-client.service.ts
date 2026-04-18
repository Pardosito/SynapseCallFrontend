import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  private readonly apiBaseUrl = environment.apiUrl;

  public constructor(private readonly http: HttpClient) {}

  public get<T>(path: string) {
    return this.http.get<T>(`${this.apiBaseUrl}${path}`);
  }

  public post<T>(path: string, body: unknown) {
    return this.http.post<T>(`${this.apiBaseUrl}${path}`, body);
  }
}
