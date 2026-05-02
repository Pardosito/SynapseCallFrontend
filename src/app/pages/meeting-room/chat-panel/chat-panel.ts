import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SignalingService } from '../../../services/signaling.service';

@Component({
  selector: 'app-chat-panel',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './chat-panel.html',
  styleUrl: './chat-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatPanel {
  private signalingService = inject(SignalingService);

  userName = input.required<string>();

  closePanel = output<void>();

  newMessage = signal('');
  messages = signal<{userName: string, message: string}[]>([]);

  constructor() {
    this.signalingService.onMessageReceived().subscribe((msg) => {
      this.messages.update((prev) => [...prev, msg]);
    });
  }

  send() {
    const text = this.newMessage().trim();
    if (text) {
      this.signalingService.sendMessage(text, this.userName());
      this.newMessage.set('');
    }
  }
}