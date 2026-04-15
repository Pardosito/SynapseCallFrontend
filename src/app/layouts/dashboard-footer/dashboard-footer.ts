import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-dashboard-footer',
  imports: [],
  templateUrl: './dashboard-footer.html',
  styleUrl: './dashboard-footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardFooter {
  protected readonly currentYear = new Date().getFullYear();
}
