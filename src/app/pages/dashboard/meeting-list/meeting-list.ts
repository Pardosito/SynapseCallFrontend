import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MeetingService } from '../../../services/meeting.service';
import { IMeeting } from '../../../shared/models/meeting.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-meeting-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meeting-list.html',
  styleUrl: './meeting-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeetingList implements OnInit {
  private meetingService = inject(MeetingService);
  private router = inject(Router);

  meetings = signal<IMeeting[]>([]);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadMeetings();
  }

  loadMeetings(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.meetingService.getMeetings().subscribe({
      next: (response: any) => {
        const meetingsArray = response.meetings || [];

        this.meetings.set(meetingsArray);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar reuniones:', err);
        this.errorMessage.set('No se pudieron cargar las reuniones.');
        this.isLoading.set(false);
      }
    });
  }

  joinMeeting(meetingId: string | undefined): void {
    if (meetingId) {
      this.router.navigate(['/room', meetingId]);
    } else {
      console.error('La reunión no tiene un ID válido');
    }
  }
}