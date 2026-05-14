import { ChangeDetectionStrategy, Component, effect, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MeetingService } from '../../../services/meeting.service';
import { IMeeting } from '../../../shared/models/meeting.model';

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
  readonly meetingSaved = output<void>();
  readonly meetingToEdit = input<IMeeting | null>(null);
  readonly hasOrg = input(false);

  title = '';
  scheduledAt = '';
  isOrgOnly = false;

  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor() {
    effect(() => {
      const meeting = this.meetingToEdit();
      this.title = meeting?.title ?? '';
      this.scheduledAt = meeting?.startTime
        ? this.toDatetimeLocalValue(meeting.startTime)
        : '';
      this.isOrgOnly = meeting?.isOrgOnly ?? false;
      this.errorMessage.set(null);
    });
  }

  protected get isEditMode(): boolean {
    return !!this.meetingToEdit();
  }

  protected get modalTitle(): string {
    return this.isEditMode ? 'Editar reunión' : 'Nueva reunión';
  }

  protected get submitText(): string {
    if (this.isLoading()) {
      return this.isEditMode ? 'Guardando...' : 'Creando...';
    }
    return this.isEditMode ? 'Guardar cambios' : 'Crear reunión';
  }

  protected submit(): void {
    if (!this.title.trim() || !this.scheduledAt) {
      this.errorMessage.set('El título y la fecha son obligatorios.');
      return;
    }

    const meeting = this.meetingToEdit();
    const startTime = new Date(this.scheduledAt);

    if (Number.isNaN(startTime.getTime())) {
      this.errorMessage.set('La fecha no tiene un formato válido.');
      return;
    }

    if (this.isEditMode && !meeting?._id) {
      this.errorMessage.set('No se encontró el identificador de la reunión.');
      return;
    }

    const payload = {
      title: this.title.trim(),
      startTime,
      isOrgOnly: this.hasOrg() ? this.isOrgOnly : false,
    };

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const request$ = this.isEditMode
      ? this.meetingService.updateMeeting(meeting!._id!, payload)
      : this.meetingService.createMeeting(payload);

    request$.subscribe({
      next: () => {
        this.isLoading.set(false);
        this.meetingSaved.emit();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'No se pudo guardar la reunión.');
      },
    });
  }

  private toDatetimeLocalValue(value: Date | string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
  }
}
