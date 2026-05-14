import { ChangeDetectionStrategy, Component, OnDestroy, input, signal } from '@angular/core';

@Component({
  selector: 'app-meeting-share',
  standalone: true,
  imports: [],
  templateUrl: './meeting-share.html',
  styleUrl: './meeting-share.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeetingShare implements OnDestroy {
  meetingId = input.required<string>();
  meetingTitle = input<string>('Reunión SynapseCall');

  protected readonly copyStatus = signal<string | null>(null);

  private copyStatusTimer: ReturnType<typeof setTimeout> | null = null;

  protected getMeetingLink(): string {
    return `${window.location.origin}/room/${this.meetingId()}`;
  }

  protected getShareText(): string {
    return `Únete a mi reunión: ${this.meetingTitle()}\nID: ${this.meetingId()}\nEnlace: ${this.getMeetingLink()}`;
  }

  private getNativeShareText(): string {
    return `Únete a mi reunión: ${this.meetingTitle()}\nID: ${this.meetingId()}`;
  }

  protected async copyMeetingId(): Promise<void> {
    await this.copyText(this.meetingId(), 'ID copiado');
  }

  protected async copyMeetingLink(): Promise<void> {
    await this.copyText(this.getMeetingLink(), 'Enlace copiado');
  }

  protected async shareMeeting(): Promise<void> {
    if (navigator.share) {
      try {
        await navigator.share({
          title: this.meetingTitle(),
          text: this.getNativeShareText(),
          url: this.getMeetingLink(),
        });

        return;
      } catch {
        return;
      }
    }

    await this.copyMeetingLink();
  }

  private async copyText(text: string, successMessage: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      this.fallbackCopyText(text);
    }

    this.showCopyStatus(successMessage);
  }

  private fallbackCopyText(text: string): void {
    const textarea = document.createElement('textarea');

    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  private showCopyStatus(message: string): void {
    this.copyStatus.set(message);

    if (this.copyStatusTimer) {
      clearTimeout(this.copyStatusTimer);
    }

    this.copyStatusTimer = setTimeout(() => {
      this.copyStatus.set(null);
    }, 2200);
  }

  ngOnDestroy(): void {
    if (this.copyStatusTimer) {
      clearTimeout(this.copyStatusTimer);
    }
  }
}