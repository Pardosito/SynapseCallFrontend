import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { DashboardHeader } from '../../layouts/dashboard-header/dashboard-header';
import { DashboardFooter } from '../../layouts/dashboard-footer/dashboard-footer';
import { MeetingList } from './meeting-list/meeting-list';
import { CreateJoinMeetingInput } from './create-join-meeting-input/create-join-meeting-input';
import { CreateMeetingModal } from './create-meeting-modal/create-meeting-modal';
import { AuthFlowService } from '../../shared/services/auth-flow.service';
import { IMeeting } from '../../shared/models/meeting.model';

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
  meetingToEdit = signal<IMeeting | null>(null);
  reloadCounter = signal(0);

  userIsLoggedIn = this.authFlowService.isAuthenticated;

 openCreateModal() {
  this.meetingToEdit.set(null);
  this.isModalOpen.set(true);
  }

  openEditModal(meeting: IMeeting) {
    this.meetingToEdit.set(meeting);
    this.isModalOpen.set(true);
  }

  closeMeetingModal() {
    this.isModalOpen.set(false);
    this.meetingToEdit.set(null);
  }

  onMeetingSaved() {
    this.closeMeetingModal();
    this.reloadCounter.update(v => v + 1);
  }
}