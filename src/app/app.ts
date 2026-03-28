import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PublicFooter } from "./layouts/public-footer/public-footer";
import { PublicHeader } from "./layouts/public-header/public-header";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PublicFooter, PublicHeader],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('SynapseCall');
}
