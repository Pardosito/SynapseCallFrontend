import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DashboardHeader } from '../../layouts/dashboard-header/dashboard-header';
import { DashboardFooter } from '../../layouts/dashboard-footer/dashboard-footer';
import { MeetingList } from './meeting-list/meeting-list';
import { CreateJoinMeetingInput } from './create-join-meeting-input/create-join-meeting-input';
import { CreateMeetingModal } from './create-meeting-modal/create-meeting-modal';
import { AuthFlowService } from '../../shared/services/auth-flow.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DashboardHeader,
    DashboardFooter,
    MeetingList,
    CreateJoinMeetingInput,
    CreateMeetingModal
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard {
  private authFlowService = inject(AuthFlowService);

  isModalOpen = signal(false);
  reloadCounter = signal(0);

  userIsLoggedIn = this.authFlowService.isAuthenticated;

  openCreateModal() {
    this.isModalOpen.set(true);
  }

  closeCreateModal() {
    this.isModalOpen.set(false);
  }

  onMeetingCreated() {
    this.closeCreateModal();
    this.reloadCounter.update(v => v + 1);
  }
}