import {
  AfterViewChecked, ChangeDetectionStrategy, Component, ElementRef,
  ViewChild, inject, input, output, signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SignalingService } from '../../../services/signaling.service';
import { MeetingFilesService, FileEntry } from '../../../services/meeting-files.service';
import { ChatMessage } from '../../../shared/models/chat-message.model';

export type { ChatMessage };

@Component({
  selector: 'app-chat-panel',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './chat-panel.html',
  styleUrl: './chat-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatPanel implements AfterViewChecked {
  @ViewChild('messagesEnd') private messagesEnd!: ElementRef<HTMLDivElement>;

  private signalingService = inject(SignalingService);
  private filesService     = inject(MeetingFilesService);

  userName   = input.required<string>();
  meetingId  = input.required<string>();
  messages   = input<ChatMessage[]>([]);
  closePanel = output<void>();

  newMessage    = '';
  pendingFile   = signal<File | null>(null);
  isUploading   = signal(false);
  uploadError   = signal(false);
  private lastMessageCount = 0;

  send(): void {
    const text = this.newMessage.trim();
    const file = this.pendingFile();
    if (!text && !file) return;

    if (text) {
      this.signalingService.sendMessage(text, this.userName());
      this.newMessage = '';
    }

    if (file) {
      this.pendingFile.set(null);
      this.isUploading.set(true);
      this.uploadError.set(false);
      this.filesService.upload(this.meetingId(), file).subscribe({
        next:  () => this.isUploading.set(false),
        error: () => { this.isUploading.set(false); this.uploadError.set(true); },
      });
    }
  }

  onFileSelected(event: Event): void {
    const el = event.target as HTMLInputElement;
    const file = el.files?.[0];
    if (!file) return;
    el.value = '';
    this.uploadError.set(false);
    this.pendingFile.set(file);
  }

  removePendingFile(): void {
    this.pendingFile.set(null);
    this.uploadError.set(false);
  }

  ngAfterViewChecked(): void {
    const count = this.messages().length;
    if (count !== this.lastMessageCount) {
      this.lastMessageCount = count;
      this.messagesEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
    }
  }

  isOwn(msg: ChatMessage): boolean {
    if (msg.fileEntry) return false;
    const myId = this.signalingService.getSocketId();
    return myId ? msg.socketId === myId : msg.userName === this.userName();
  }

  displayName = (entry: FileEntry) => this.filesService.displayName(entry);

  formatTime(sentAt: string): string {
    return new Date(sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
