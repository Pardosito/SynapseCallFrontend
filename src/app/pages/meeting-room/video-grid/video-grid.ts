import {
  ChangeDetectionStrategy, Component, ElementRef,
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
  private peers = new Map<string, RTCPeerConnection>();
  private subs: Subscription[] = [];

  readonly isMuted     = input<boolean>(false);
  readonly isCameraOff = input<boolean>(false);

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
    this.setupSignaling();
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

      this.signalingService.onAnswer().subscribe(({ from, answer }) => {
        console.log('[VideoGrid] answer received from:', from);
        this.peers.get(from)?.setRemoteDescription(new RTCSessionDescription(answer));
      }),

      this.signalingService.onIceCandidate().subscribe(({ from, candidate }) => {
        console.log('[VideoGrid] ICE candidate from:', from);
        this.peers.get(from)?.addIceCandidate(new RTCIceCandidate(candidate));
      }),

      this.signalingService.onUserDisconnected().subscribe(socketId => {
        console.log('[VideoGrid] user-disconnected:', socketId);
        this.closePeer(socketId);
      }),
    );
  }

  private async createPeer(socketId: string): Promise<RTCPeerConnection> {
    const pc = new RTCPeerConnection(ICE_CONFIG);

    // Wait for local stream so tracks are always added
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
      const stream = streams[0];
      console.log('[VideoGrid] ontrack fired from:', socketId, 'stream:', stream?.id);
      if (!stream) return;
      this.remoteVideos.update(list => {
        if (list.find(v => v.socketId === socketId)) return list;
        return [...list, { socketId, stream }];
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
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    console.log('[VideoGrid] Sending answer to:', from);
    this.signalingService.sendAnswer(from, answer);
  }

  private closePeer(socketId: string): void {
    this.peers.get(socketId)?.close();
    this.peers.delete(socketId);
    this.remoteVideos.update(list => list.filter(v => v.socketId !== socketId));
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    this.peers.forEach((_, id) => this.closePeer(id));
    this.myStream()?.getTracks().forEach(t => t.stop());
  }
}
