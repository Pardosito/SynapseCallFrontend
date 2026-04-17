import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  authState = signal<boolean>(!!this.getToken());

  getToken(): string {
    return localStorage.getItem("token") || "";
  }

  setToken(token: string): void {
    localStorage.setItem("token", token);
    this.authState.set(true);
  }

  deleteToken(): void {
    localStorage.removeItem("token");
    this.authState.set(false);
  }

  isLoggedIn(): boolean {
    return this.authState();
  }
}