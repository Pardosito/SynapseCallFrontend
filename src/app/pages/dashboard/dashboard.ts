import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { DashboardHeader } from '../../layouts/dashboard-header/dashboard-header';
import { DashboardFooter } from '../../layouts/dashboard-footer/dashboard-footer';
import { MeetingList } from './meeting-list/meeting-list';
import { CreateJoinMeetingInput } from './create-join-meeting-input/create-join-meeting-input';
import { CreateMeetingModal } from './create-meeting-modal/create-meeting-modal';
import { AuthFlowService } from '../../shared/services/auth-flow.service';
import { OrganizationsService } from '../../services/organizations.service';
import { IMeeting } from '../../shared/models/meeting.model';
import { IOrganization } from '../../shared/models/org.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    DatePipe,
    DashboardHeader,
    DashboardFooter,
    MeetingList,
    CreateJoinMeetingInput,
    CreateMeetingModal,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dashboard implements OnInit {
  private authFlowService = inject(AuthFlowService);
  private organizationsService = inject(OrganizationsService);

  isModalOpen = signal(false);
  meetingToEdit = signal<IMeeting | null>(null);
  reloadCounter = signal(0);
  myOrganization = signal<IOrganization | null>(null);

  isJoinModalOpen = signal(false);
  joinInput = signal('');
  joinError = signal('');
  isJoining = signal(false);

  userIsLoggedIn = this.authFlowService.isAuthenticated;

  isOwner = computed(() => this.myOrganization()?.isOwner === true);

  ngOnInit(): void {
    this.loadMyOrg();
  }

  private loadMyOrg(): void {
    this.organizationsService.getMyOrg().subscribe({
      next: (org) => this.myOrganization.set(org),
      error: () => this.myOrganization.set(null),
    });
  }

  copyInviteLink(org: IOrganization): void {
    const orgId = org._id ?? org.id;
    const link = `${window.location.origin}/join/${orgId}`;
    navigator.clipboard.writeText(link).catch(() => {});
  }

  deleteOrg(org: IOrganization): void {
    const orgId = org._id ?? org.id;
    if (!orgId) return;
    this.organizationsService.deleteOrgById(orgId).subscribe({
      next: () => this.myOrganization.set(null),
      error: () => {},
    });
  }

  leaveOrg(org: IOrganization): void {
    const orgId = org._id ?? org.id;
    if (!orgId) return;
    this.organizationsService.leaveOrg(orgId).subscribe({
      next: () => this.myOrganization.set(null),
      error: () => {},
    });
  }

  openJoinModal(): void {
    this.joinInput.set('');
    this.joinError.set('');
    this.isJoinModalOpen.set(true);
  }

  closeJoinModal(): void {
    this.isJoinModalOpen.set(false);
  }

  submitJoinOrg(): void {
    const raw = this.joinInput().trim();
    if (!raw) {
      this.joinError.set('Ingresa un enlace o código de organización.');
      return;
    }

    const orgId = this.parseOrgId(raw);
    this.joinError.set('');
    this.isJoining.set(true);

    this.organizationsService.joinOrg(orgId).subscribe({
      next: (res) => {
        this.myOrganization.set(res.organization);
        this.isJoining.set(false);
        this.isJoinModalOpen.set(false);
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'No se pudo unir a la organización.';
        this.joinError.set(msg);
        this.isJoining.set(false);
      },
    });
  }

  private parseOrgId(input: string): string {
    try {
      const url = new URL(input);
      const segments = url.pathname.split('/').filter(Boolean);
      return segments[segments.length - 1] ?? input;
    } catch {
      return input;
    }
  }

  openCreateModal(): void {
    this.meetingToEdit.set(null);
    this.isModalOpen.set(true);
  }

  openEditModal(meeting: IMeeting): void {
    this.meetingToEdit.set(meeting);
    this.isModalOpen.set(true);
  }

  closeMeetingModal(): void {
    this.isModalOpen.set(false);
    this.meetingToEdit.set(null);
  }

  onMeetingSaved(): void {
    this.closeMeetingModal();
    this.reloadCounter.update(v => v + 1);
  }
}
