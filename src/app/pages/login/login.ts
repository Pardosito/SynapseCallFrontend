import { Component } from '@angular/core';
import { PublicFooter } from '../../layouts/public-footer/public-footer';
import { PublicHeader } from '../../layouts/public-header/public-header';

@Component({
  selector: 'app-login',
  imports: [PublicHeader, PublicFooter],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {}
