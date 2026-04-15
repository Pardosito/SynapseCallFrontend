import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  private readonly apiBaseUrl = 'http://localhost:3000';

  public constructor(private readonly http: HttpClient) {}

  public get<T>(path: string) {
    return this.http.get<T>(`${this.apiBaseUrl}${path}`, { withCredentials: true });
  }

  public post<T>(path: string, body: unknown) {
    return this.http.post<T>(`${this.apiBaseUrl}${path}`, body, {
      withCredentials: true,
    });
  }
}
