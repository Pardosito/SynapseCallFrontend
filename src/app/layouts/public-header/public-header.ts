import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthFlowService } from '../../shared/services/auth-flow.service';

@Component({
  selector: 'app-public-header',
  imports: [RouterLink],
  templateUrl: './public-header.html',
  styleUrl: './public-header.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicHeader {
  public constructor(
    protected readonly authFlow: AuthFlowService,
    private readonly router: Router,
  ) {}

  protected onLogout(): void {
    this.authFlow.logout();
    void this.router.navigateByUrl('/');
  }
}
