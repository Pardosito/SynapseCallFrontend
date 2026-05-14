import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MeetingService } from '../../../services/meeting.service';
import { IMeeting } from '../../../shared/models/meeting.model';
import { Router } from '@angular/router';

type DateFilter = 'all' | 'today' | 'week' | 'month';
type VisibilityFilter = 'all' | 'org-only' | 'public';
type StatusFilter = 'all' | 'scheduled' | 'ongoing' | 'ended';

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

  dateFilter = signal<DateFilter>('all');
  visibilityFilter = signal<VisibilityFilter>('all');
  statusFilter = signal<StatusFilter>('all');

  filteredMeetings = computed(() => {
    const date = this.dateFilter();
    const visibility = this.visibilityFilter();
    const status = this.statusFilter();
    const now = new Date();

    return this.meetings().filter((m) => {
      const start = new Date(m.startTime);

      if (date === 'today') {
        if (start.toDateString() !== now.toDateString()) return false;
      } else if (date === 'week') {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 7);
        if (start < weekStart || start >= weekEnd) return false;
      } else if (date === 'month') {
        if (start.getMonth() !== now.getMonth() || start.getFullYear() !== now.getFullYear()) return false;
      }

      if (visibility === 'org-only' && !m.isOrgOnly) return false;
      if (visibility === 'public' && m.isOrgOnly) return false;

      if (status !== 'all' && m.status !== status) return false;

      return true;
    });
  });

  hasActiveFilters = computed(() =>
    this.dateFilter() !== 'all' ||
    this.visibilityFilter() !== 'all' ||
    this.statusFilter() !== 'all'
  );

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
      },
    });
  }

  clearFilters(): void {
    this.dateFilter.set('all');
    this.visibilityFilter.set('all');
    this.statusFilter.set('all');
  }

  editMeeting(meeting: IMeeting): void {
    this.editMeetingSelected.emit(meeting);
  }

  deleteMeeting(meetingId: string | undefined): void {
    if (!meetingId) return;
    if (!window.confirm('¿Seguro que quieres eliminar esta reunión?')) return;

    this.isLoading.set(true);
    this.meetingService.deleteMeeting(meetingId).subscribe({
      next: () => this.loadMeetings(),
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'No se pudo eliminar la reunión.');
        this.isLoading.set(false);
      },
    });
  }

  joinMeeting(meetingId: string | undefined): void {
    if (meetingId) this.router.navigate(['/room', meetingId]);
  }

  statusLabel(status: IMeeting['status']): string {
    return { scheduled: 'Programada', ongoing: 'En curso', ended: 'Finalizada' }[status] ?? status;
  }
}
