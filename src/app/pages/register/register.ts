import { Component } from '@angular/core';
import { PublicFooter } from '../../layouts/public-footer/public-footer';
import { PublicHeader } from '../../layouts/public-header/public-header';

@Component({
  selector: 'app-register',
  imports: [PublicHeader, PublicFooter],
  templateUrl: './register.html',
  styleUrl: './register.scss',
})
export class Register {}
