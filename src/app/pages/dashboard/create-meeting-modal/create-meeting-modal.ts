import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Obligatorio para usar [(ngModel)]
import { MeetingService } from '../../../services/meeting.service';

@Component({
  selector: 'app-create-meeting-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-meeting-modal.html',
  styleUrl: './create-meeting-modal.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateMeetingModal {
  private meetingService = inject(MeetingService);

  readonly close = output<void>();
  readonly meetingCreated = output<void>();

  title = '';
  scheduledAt = '';

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  protected submit(): void {
    if (!this.title.trim() || !this.scheduledAt) {
      this.errorMessage.set('El título y la fecha son obligatorios.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.meetingService.createMeeting({
      title: this.title.trim(),
      startTime: new Date(this.scheduledAt)
    }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.meetingCreated.emit();
        this.close.emit();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Error al crear la reunión.');
      }
    });
  }
}