import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthFlowService } from '../../shared/services/auth-flow.service';

@Component({
  selector: 'app-dashboard-header',
  imports: [RouterLink],
  templateUrl: './dashboard-header.html',
  styleUrl: './dashboard-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardHeader {
  public constructor(
    protected readonly authFlow: AuthFlowService,
    private readonly router: Router,
  ) {}

  protected onLogout(): void {
    this.authFlow.logout().subscribe({
      next: () => void this.router.navigateByUrl('/'),
    });
  }

  protected readonly currentDate = new Date().toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}
