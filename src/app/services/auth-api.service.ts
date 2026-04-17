import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development'; //TODO: Hay que cambiar a la de prod ya que terminemos el desarrollo
import { Observable } from 'rxjs';
import { AuthUser, LoginPayload, SignupPayload, ApiMessageResponse, GooglePayload } from '../shared/models/auth.models';
import { AuthService } from './auth.service';

export interface AuthResponse {
  token?: string;
  message?: string;
  user?: any;
}

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private http = inject(HttpClient);
  private authService: AuthService = inject(AuthService);
  private baseUrl = `${environment.apiUrl}/auth`;

  signup(email: string, password: string, name: string): Observable<AuthResponse> {
    const payload: SignupPayload = {
      name,
      email,
      password_hash: password
    };

    return this.http.post<AuthResponse>(`${this.baseUrl}/signup`, payload);
  }

  login(email: string, password: string): Observable<AuthResponse> {
    const payload: LoginPayload = {
      email,
      password_hash: password
    };

    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, payload);
  }

  logout(): Observable<ApiMessageResponse> {
    return this.http.post<ApiMessageResponse>(`${this.baseUrl}/logout`, {}, { withCredentials: true });
  }

  verifyAccount(token: string): Observable<ApiMessageResponse> {
    return this.http.get<ApiMessageResponse>(`${this.baseUrl}/verify-account/${token}`);
  }

  resetPassword(email: string): Observable<ApiMessageResponse> {
    const payload: AuthUser = {
      email
    };
    const token: string = this.authService.getToken();
    return this.http.post<ApiMessageResponse>(`${this.baseUrl}/reset-password/${token}`, payload);
  }

  forgotPassword(email: string): Observable<ApiMessageResponse> {
    const token: string = this.authService.getToken();
    const payload: AuthUser = {
      email
    };

    return this.http.post<ApiMessageResponse>(`${this.baseUrl}/forgot-password`, payload);
  }

  googleLogin(googleId: string, email: string, name: string): Observable<AuthResponse> {
    const payload: GooglePayload = {
      googleId,
      email,
      name
    };
    return this.http.post<AuthResponse>(`${this.baseUrl}/google`, payload);
  }

}