import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HtmlParser } from '@angular/compiler';
import { environment } from '../../environments/environment.development'; //TODO: Hay que cambiar a la de prod ya que terminemos el desarrollo

@Injectable({
  providedIn: 'root',
})
export class Organizations {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  //TODO: Tmb, hay que ver que rollo con las llamadas al backend para toda esta info
  createNewOrg() {

  }

  addMemberToOrg() {

  }

  getOrgById() {

  }

  updateOrgById() {

  }

  deleteOrgById() {

  }


}
