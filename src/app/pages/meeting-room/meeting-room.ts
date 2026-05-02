import { ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MeetingService } from '../../services/meeting.service';
import { IMeeting } from '../../shared/models/meeting.model';
import { VideoGrid } from './video-grid/video-grid';
import { MediaControls } from './media-controls/media-controls';
import { ChatPanel } from './chat-panel/chat-panel';
import { FileViewer } from './file-viewer/file-viewer';
import { AgendaPanel } from './agenda-panel/agenda-panel';
import { SignalingService } from '../../services/signaling.service';
@Component({
  selector: 'app-meeting-room',
  standalone: true,
  imports: [VideoGrid, MediaControls, ChatPanel, FileViewer, AgendaPanel],
  templateUrl: './meeting-room.html',
  styleUrl: './meeting-room.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MeetingRoom implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private meetingService = inject(MeetingService);
  private signalingService = inject(SignalingService);

  protected readonly isChatOpen = signal(false);
  protected readonly isAgendaOpen = signal(false);
  protected readonly isFileViewerOpen = signal(false);
  protected readonly isMuted = signal(false);
  protected readonly isCameraOff = signal(false);

  meetingId = signal<string | null>(null);
  meetingData = signal<IMeeting | null>(null);
  meetingConfig = signal<any>(null);
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

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

  loadMeetingDetails(id: string) {
    this.meetingService.getMeetingById(id).subscribe({
      next: (data: any) => {
        this.meetingData.set(data.meeting);
        this.meetingConfig.set(data.config);
        this.isLoading.set(false);

        this.signalingService.connect();
        const myUserName = data.config.userName || 'Usuario';
        this.signalingService.joinRoom(id, myUserName);

        this.signalingService.onUserJoined().subscribe((newUserId) => {
          console.log('Preparando video para:', newUserId);
        });
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'La reunión no existe o no tienes acceso.');
        this.isLoading.set(false);
      }
    });
  }

  protected onToggleMute(): void {
    this.isMuted.update(v => !v);
  }

  protected onToggleCamera(): void {
    this.isCameraOff.update(v => !v);
  }

  protected toggleChat(): void {
    this.isAgendaOpen.set(false);
    this.isFileViewerOpen.set(false);
    this.isChatOpen.update(v => !v);
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
    this.signalingService.disconnect();
  }
}
