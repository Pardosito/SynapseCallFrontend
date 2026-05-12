import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-media-controls',
  standalone: true,
  imports: [],
  templateUrl: './media-controls.html',
  styleUrl: './media-controls.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MediaControls {
  isMuted = input<boolean>(false);
  isCameraOff = input<boolean>(false);
  isChatOpen   = input<boolean>(false);
  isAgendaOpen = input<boolean>(false);
  unreadCount  = input<number>(0);

  toggleMuteEvent = output<void>();
  toggleCameraEvent = output<void>();
  toggleChatEvent = output<void>();
  toggleAgendaEvent = output<void>();
  toggleFilesEvent = output<void>();
  leaveMeetingEvent = output<void>();
}
