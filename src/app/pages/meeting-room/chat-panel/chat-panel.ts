import {
  ChangeDetectionStrategy, Component, ElementRef, OnInit,
  ViewChild, inject, input, output, signal,
} from '@angular/core';
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
export class ChatPanel implements OnInit {
  @ViewChild('messagesEnd') private messagesEnd!: ElementRef<HTMLDivElement>;

  private signalingService = inject(SignalingService);

  userName = input.required<string>();
  closePanel = output<void>();

  newMessage = '';
  messages = signal<{ userName: string; message: string }[]>([]);

  ngOnInit(): void {
    this.signalingService.onMessageReceived().subscribe(msg => {
      this.messages.update(prev => [...prev, msg]);
      setTimeout(() => this.scrollToBottom(), 0);
    });
  }

  send(): void {
    const text = this.newMessage.trim();
    if (!text) return;
    this.signalingService.sendMessage(text, this.userName());
    this.newMessage = '';
  }

  isOwn(msg: { userName: string }): boolean {
    return msg.userName === this.userName();
  }

  private scrollToBottom(): void {
    this.messagesEnd?.nativeElement?.scrollIntoView({ behavior: 'smooth' });
  }
}
