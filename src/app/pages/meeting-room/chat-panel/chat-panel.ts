import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'app-chat-panel',
  standalone: true,
  imports: [],
  templateUrl: './chat-panel.html',
  styleUrl: './chat-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatPanel {
  closePanel = output<void>();
}
