import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development'; //TODO: Hay que cambiar a la de prod ya que terminemos el desarrollo
import { UserResponse, IncludedUserResponse, IUser } from '../shared/models/user.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/users`;

  getPersonalUser(): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.baseUrl}/me`);
  }

  updatePersonalUser(data: Partial<IUser>) {
    return this.http.patch<IncludedUserResponse>(`${this.baseUrl}/me`, data);
  }

  getUserById(userId: string): Observable<IncludedUserResponse> {
    return this.http.get<IncludedUserResponse>(`${this.baseUrl}/${userId}`);
  }

  deleteUserById(userId: string): Observable<UserResponse> {
    return this.http.delete<UserResponse>(`${this.baseUrl}/${userId}`)
  }
}
