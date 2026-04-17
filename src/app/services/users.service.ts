import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment.development'; //TODO: Hay que cambiar a la de prod ya que terminemos el desarrollo

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  getPersonalUser() {

  }

  updatePersonalUser() {

  }

  getUserById() {

  }

  deleteUserById() {

  }



}
