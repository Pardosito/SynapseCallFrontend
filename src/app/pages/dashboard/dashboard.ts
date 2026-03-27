import { Component } from '@angular/core';
import { DashboardFooter } from '../../layouts/dashboard-footer/dashboard-footer';
import { DashboardHeader } from '../../layouts/dashboard-header/dashboard-header';

@Component({
  selector: 'app-dashboard',
  imports: [DashboardHeader, DashboardFooter],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {}
