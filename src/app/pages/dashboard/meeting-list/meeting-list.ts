import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
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
  readonly editMeetingSelected = output<IMeeting>();

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

  editMeeting(meeting: IMeeting): void {
    this.editMeetingSelected.emit(meeting);
  }

  deleteMeeting(meetingId: string | undefined): void {
    if (!meetingId) return;

    const confirmed = window.confirm('¿Seguro que quieres eliminar esta reunión?');
    if (!confirmed) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.meetingService.deleteMeeting(meetingId).subscribe({
      next: () => this.loadMeetings(),
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'No se pudo eliminar la reunión.');
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
