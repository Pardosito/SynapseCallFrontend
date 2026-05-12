import {
  ChangeDetectionStrategy, Component, computed,
  inject, OnDestroy, OnInit, signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MeetingService } from '../../services/meeting.service';
import { IMeeting } from '../../shared/models/meeting.model';
import { ChatMessage } from '../../shared/models/chat-message.model';
import { VideoGrid } from './video-grid/video-grid';
import { MediaControls } from './media-controls/media-controls';
import { ChatPanel } from './chat-panel/chat-panel';
import { FileViewer } from './file-viewer/file-viewer';
import { AgendaPanel } from './agenda-panel/agenda-panel';
import { SignalingService } from '../../services/signaling.service';
import { AuthFlowService } from '../../shared/services/auth-flow.service';

@Component({
  selector: 'app-meeting-room',
  standalone: true,
  imports: [VideoGrid, MediaControls, ChatPanel, FileViewer, AgendaPanel],
  templateUrl: './meeting-room.html',
  styleUrl: './meeting-room.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeetingRoom implements OnInit, OnDestroy {
  private route            = inject(ActivatedRoute);
  private router           = inject(Router);
  private meetingService   = inject(MeetingService);
  private signalingService = inject(SignalingService);
  private authFlow         = inject(AuthFlowService);

  protected readonly isChatOpen       = signal(false);
  protected readonly isAgendaOpen     = signal(false);
  protected readonly isFileViewerOpen = signal(false);
  protected readonly isMuted          = signal(false);
  protected readonly isCameraOff      = signal(false);
  protected readonly chatMessages     = signal<ChatMessage[]>([]);
  protected readonly unreadCount      = signal(0);

  meetingId     = signal<string | null>(null);
  meetingData   = signal<IMeeting | null>(null);
  meetingConfig = signal<any>(null);
  isLoading     = signal(true);
  errorMessage  = signal<string | null>(null);

  private chatSubs: Subscription[] = [];

  readonly userName = computed(() => {
    const configName = this.meetingConfig()?.userName;
    if (configName && configName !== 'Invitado') return configName;
    const user = this.authFlow.currentUser();
    return user?.name || user?.email || 'Usuario';
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.meetingId.set(id);
      this.loadMeetingDetails(id);
    } else {
      this.errorMessage.set('ID de reunión no válido.');
      this.isLoading.set(false);
    }
  }

  loadMeetingDetails(id: string): void {
    this.meetingService.getMeetingById(id).subscribe({
      next: (data: any) => {
        this.meetingData.set(data.meeting);
        this.meetingConfig.set(data.config);
        this.isLoading.set(false);

        this.signalingService.connect();
        this.signalingService.joinRoom(id, this.userName());
        this.subscribeToChat();
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'La reunión no existe o no tienes acceso.');
        this.isLoading.set(false);
      }
    });
  }

  private subscribeToChat(): void {
    this.chatSubs.push(
      this.signalingService.onMessageReceived().subscribe(msg => {
        this.chatMessages.update(prev => [...prev, msg]);
        if (!this.isChatOpen()) this.unreadCount.update(n => n + 1);
      }),
      this.signalingService.onFileUploaded().subscribe(file => {
        const card: ChatMessage = {
          userName: '', message: '', sentAt: new Date().toISOString(), socketId: '', fileEntry: file,
        };
        this.chatMessages.update(prev => [...prev, card]);
        if (!this.isChatOpen()) this.unreadCount.update(n => n + 1);
      }),
    );
  }

  protected onToggleMute(): void   { this.isMuted.update(v => !v); }
  protected onToggleCamera(): void { this.isCameraOff.update(v => !v); }

  protected toggleChat(): void {
    this.isAgendaOpen.set(false);
    this.isFileViewerOpen.set(false);
    this.isChatOpen.update(v => !v);
    if (this.isChatOpen()) this.unreadCount.set(0);
  }

  protected toggleAgenda(): void {
    this.isChatOpen.set(false);
    this.isFileViewerOpen.set(false);
    this.isAgendaOpen.update(v => !v);
  }

  protected toggleFileViewer(): void {
    this.isChatOpen.set(false);
    this.isAgendaOpen.set(false);
    this.isFileViewerOpen.update(v => !v);
  }

  leaveMeeting(): void {
    this.signalingService.disconnect();
    this.router.navigate(['/dashboard']);
  }

  ngOnDestroy(): void {
    this.chatSubs.forEach(s => s.unsubscribe());
    this.signalingService.disconnect();
  }
}
