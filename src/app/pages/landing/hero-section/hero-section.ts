import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthFlowService } from '../../../shared/services/auth-flow.service';

@Component({
  selector: 'app-hero-section',
  imports: [RouterLink],
  templateUrl: './hero-section.html',
  styleUrl: './hero-section.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroSection {
  protected readonly authFlow = inject(AuthFlowService)

  protected readonly benefits = [
    'Reuniones HD de baja latencia',
    'Chat y archivos durante la llamada',
    'Acceso por enlace en segundos',
  ];
}
