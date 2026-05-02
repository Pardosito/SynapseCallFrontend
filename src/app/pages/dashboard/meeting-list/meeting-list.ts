import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MeetingService } from '../../../services/meeting.service';
import { IMeeting } from '../../../shared/models/meeting.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-meeting-list',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './meeting-list.html',
  styleUrl: './meeting-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeetingList {
  private meetingService = inject(MeetingService);
  private router = inject(Router);

  readonly reloadTrigger = input(0);

  meetings = signal<IMeeting[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  constructor() {
    effect(() => {
      this.reloadTrigger();
      this.loadMeetings();
    });
  }

  loadMeetings(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.meetingService.getMeetings().subscribe({
      next: (response: any) => {
        this.meetings.set(response.meetings || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.errorMessage.set('No se pudieron cargar las reuniones.');
        this.isLoading.set(false);
      }
    });
  }

  joinMeeting(meetingId: string | undefined): void {
    if (meetingId) {
      this.router.navigate(['/room', meetingId]);
    }
  }

  statusLabel(status: IMeeting['status']): string {
    return { scheduled: 'Programada', ongoing: 'En curso', ended: 'Finalizada' }[status] ?? status;
  }
}
