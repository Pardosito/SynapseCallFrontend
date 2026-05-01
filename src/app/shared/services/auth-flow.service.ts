import { Injectable, computed, signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {
  ApiMessageResponse,
  AuthResponse,
  AuthState,
  AuthUser,
  LoginPayload,
  SignupPayload,
  GooglePayload
} from '../models/auth.models';
import { ApiClientService } from './api-client.service';
import { LocalStorageService } from './local-storage.service';
import { SessionStorageService } from './session-storage.service';

const AUTH_STATE_KEY = 'synapse.auth.state';

@Injectable({ providedIn: 'root' })
export class AuthFlowService {
  private readonly state = signal<AuthState>({
    accessToken: null,
    user: null,
  });

  public readonly accessToken = computed(() => this.state().accessToken);
  public readonly currentUser = computed(() => this.state().user);
  public readonly isAuthenticated = computed(() => !!this.state().accessToken);

  public constructor(
    private readonly apiClient: ApiClientService,
    private readonly sessionStorageService: SessionStorageService,
    private readonly localStorageService: LocalStorageService,
  ) {
    this.hydrateMemoryFromStorages();
  }

  public signup(payload: SignupPayload): Observable<ApiMessageResponse> {
    return this.apiClient.post<ApiMessageResponse>('/auth/signup', payload);
  }

  public login(payload: LoginPayload): Observable<AuthResponse> {
    return this.apiClient.post<AuthResponse>('/auth/login', payload).pipe(
      tap((response: any) => {

        const tokenRecibido = response.accessToken || response.token || null;

        this.persistState({
          accessToken: tokenRecibido,
          user: response.user ?? this.currentUser(),
        });
      }),
    );
  }

  public loadCurrentUser(force = false): Observable<AuthUser | null> {
    if (!force) {
      const inMemoryUser = this.currentUser();
      if (inMemoryUser) {
        return of(inMemoryUser);
      }

      const fromSession = this.getStoredState(this.sessionStorageService);
      if (fromSession?.user) {
        this.state.set(fromSession);
        return of(fromSession.user);
      }
    }

    return this.apiClient.get<AuthUser>('/users/me').pipe(
      tap((user) => {
        this.persistState({
          accessToken: this.accessToken(),
          user,
        });
      }),
      map((user) => user ?? null),
      catchError((error: unknown) => {
        if (!force && this.currentUser()) {
          return of(this.currentUser());
        }
        return throwError(() => error);
      }),
    );
  }

  public logout(): Observable<ApiMessageResponse> {
    return this.apiClient.post<ApiMessageResponse>('/auth/logout', {}).pipe(
      catchError(() => of({ message: 'Logged out' })),
      tap(() => this.clearState()),
    );
  }

  private hydrateMemoryFromStorages(): void {
    const inMemory = this.state();
    if (inMemory.user || inMemory.accessToken) {
      return;
    }

    const fromSession = this.getStoredState(this.sessionStorageService);
    if (fromSession) {
      this.state.set(fromSession);
      return;
    }

    const fromLocal = this.getStoredState(this.localStorageService);
    if (fromLocal) {
      this.sessionStorageService.setItem(AUTH_STATE_KEY, fromLocal);
      this.state.set(fromLocal);
    }
  }

  private getStoredState(
    storageService: SessionStorageService | LocalStorageService,
  ): AuthState | null {
    const value = storageService.getItem<AuthState>(AUTH_STATE_KEY);
    if (!value) {
      return null;
    }

    return {
      accessToken: value.accessToken ?? null,
      user: value.user ?? null,
    };
  }

  private persistState(nextState: AuthState): void {
    this.localStorageService.setItem(AUTH_STATE_KEY, nextState);
    this.sessionStorageService.setItem(AUTH_STATE_KEY, nextState);
    this.state.set(nextState);
  }

  public verifyAccount(token: string): Observable<ApiMessageResponse> {
    return this.apiClient.get<ApiMessageResponse>(`/auth/verify-account/${token}`);
  }

  public resetPassword(email: string, token: string): Observable<ApiMessageResponse> {
    const payload: AuthUser = { email };
    return this.apiClient.post<ApiMessageResponse>(`/auth/reset-password/${token}`, payload);
  }

  public forgotPassword(email: string): Observable<ApiMessageResponse> {
    const payload: AuthUser = { email };
    return this.apiClient.post<ApiMessageResponse>('/auth/forgot-password', payload);
  }

  public googleLogin(payload: GooglePayload): Observable<AuthResponse> {
    return this.apiClient.post<AuthResponse>('/auth/google', payload).pipe(
      tap((response) => {
        this.persistState({
          accessToken: response.accessToken ?? null,
          user: response.user ?? this.currentUser(),
        });
      }),
    );
  }

  private clearState(): void {
    this.state.set({ accessToken: null, user: null });
    this.sessionStorageService.removeItem(AUTH_STATE_KEY);
    this.localStorageService.removeItem(AUTH_STATE_KEY);
  }
}
