import {
  ChangeDetectionStrategy, Component, ElementRef, NgZone,
  OnDestroy, OnInit, ViewChild, effect, inject, input, signal,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { SignalingService } from '../../../services/signaling.service';
import { StreamDirective } from './stream.directive';

interface RemoteVideo {
  socketId: string;
  stream: MediaStream;
}

const ICE_CONFIG: RTCConfiguration = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

@Component({
  selector: 'app-video-grid',
  standalone: true,
  imports: [StreamDirective],
  templateUrl: './video-grid.html',
  styleUrl: './video-grid.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoGrid implements OnInit, OnDestroy {
  @ViewChild('myVideoElement', { static: true }) myVideo!: ElementRef<HTMLVideoElement>;

  private signalingService = inject(SignalingService);
  private ngZone = inject(NgZone);
  private peers = new Map<string, RTCPeerConnection>();
  private pendingCandidates = new Map<string, RTCIceCandidateInit[]>();
  private subs: Subscription[] = [];

  readonly isMuted     = input<boolean>(false);
  readonly isCameraOff = input<boolean>(false);
  readonly meetingId   = input<string | null>(null);
  readonly userName    = input<string>('');

  myStream     = signal<MediaStream | null>(null);
  remoteVideos = signal<RemoteVideo[]>([]);

  constructor() {
    effect(() => {
      const muted = this.isMuted();
      this.myStream()?.getAudioTracks().forEach(t => (t.enabled = !muted));
    });
    effect(() => {
      const off = this.isCameraOff();
      this.myStream()?.getVideoTracks().forEach(t => (t.enabled = !off));
    });
  }

  ngOnInit(): void {
    this.startMyVideo();
    // Subscribe to signaling events BEFORE joining the room so no events are missed
    this.setupSignaling();
    const id = this.meetingId();
    if (id) this.signalingService.joinRoom(id, this.userName());
  }

  async startMyVideo(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      this.myStream.set(stream);
      this.myVideo.nativeElement.srcObject = stream;
      console.log('[VideoGrid] Local stream ready, tracks:', stream.getTracks().map(t => t.kind));
    } catch (e) {
      console.error('[VideoGrid] Error al acceder a la cámara/micrófono:', e);
    }
  }

  private getLocalStream(): Promise<MediaStream> {
    const current = this.myStream();
    if (current) return Promise.resolve(current);
    return new Promise(resolve => {
      const interval = setInterval(() => {
        const s = this.myStream();
        if (s) { clearInterval(interval); resolve(s); }
      }, 100);
    });
  }

  private flushPendingCandidates(socketId: string, pc: RTCPeerConnection): void {
    const queued = this.pendingCandidates.get(socketId) ?? [];
    queued.forEach(c => pc.addIceCandidate(new RTCIceCandidate(c)));
    this.pendingCandidates.delete(socketId);
  }

  private setupSignaling(): void {
    this.subs.push(
      this.signalingService.onUserJoined().subscribe(socketId => {
        console.log('[VideoGrid] user-connected:', socketId);
        this.createOffer(socketId);
      }),

      this.signalingService.onOffer().subscribe(({ from, offer }) => {
        console.log('[VideoGrid] offer received from:', from);
        this.handleOffer(from, offer);
      }),

      this.signalingService.onAnswer().subscribe(async ({ from, answer }) => {
        console.log('[VideoGrid] answer received from:', from);
        const pc = this.peers.get(from);
        if (!pc) return;
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        this.flushPendingCandidates(from, pc);
      }),

      this.signalingService.onIceCandidate().subscribe(({ from, candidate }) => {
        console.log('[VideoGrid] ICE candidate from:', from);
        const pc = this.peers.get(from);
        if (!pc || !pc.remoteDescription) {
          const queue = this.pendingCandidates.get(from) ?? [];
          queue.push(candidate);
          this.pendingCandidates.set(from, queue);
        } else {
          pc.addIceCandidate(new RTCIceCandidate(candidate));
        }
      }),

      this.signalingService.onUserDisconnected().subscribe(socketId => {
        console.log('[VideoGrid] user-disconnected:', socketId);
        this.closePeer(socketId);
      }),
    );
  }

  private async createPeer(socketId: string): Promise<RTCPeerConnection> {
    const pc = new RTCPeerConnection(ICE_CONFIG);

    const stream = await this.getLocalStream();
    stream.getTracks().forEach(track => {
      pc.addTrack(track, stream);
      console.log('[VideoGrid] Added local track to peer:', track.kind);
    });

    pc.onicecandidate = ({ candidate }) => {
      if (candidate) {
        console.log('[VideoGrid] Sending ICE candidate to:', socketId);
        this.signalingService.sendIceCandidate(socketId, candidate.toJSON());
      }
    };

    pc.onconnectionstatechange = () => {
      console.log('[VideoGrid] Connection state with', socketId, ':', pc.connectionState);
    };

    pc.ontrack = ({ streams }) => {
      const remoteStream = streams[0];
      console.log('[VideoGrid] ontrack fired from:', socketId, 'stream:', remoteStream?.id);
      if (!remoteStream) return;
      this.ngZone.run(() => {
        this.remoteVideos.update(list => {
          if (list.find(v => v.socketId === socketId)) return list;
          return [...list, { socketId, stream: remoteStream }];
        });
      });
    };

    this.peers.set(socketId, pc);
    return pc;
  }

  private async createOffer(socketId: string): Promise<void> {
    const pc = await this.createPeer(socketId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    console.log('[VideoGrid] Sending offer to:', socketId);
    this.signalingService.sendOffer(socketId, offer);
  }

  private async handleOffer(from: string, offer: RTCSessionDescriptionInit): Promise<void> {
    const pc = await this.createPeer(from);
    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    this.flushPendingCandidates(from, pc);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    console.log('[VideoGrid] Sending answer to:', from);
    this.signalingService.sendAnswer(from, answer);
  }

  private closePeer(socketId: string): void {
    this.peers.get(socketId)?.close();
    this.peers.delete(socketId);
    this.pendingCandidates.delete(socketId);
    this.remoteVideos.update(list => list.filter(v => v.socketId !== socketId));
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.peers.forEach((_, id) => this.closePeer(id));
    this.myStream()?.getTracks().forEach(t => t.stop());
  }
}
