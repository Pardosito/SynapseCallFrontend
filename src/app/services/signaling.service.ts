import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthFlowService } from '../shared/services/auth-flow.service';
import { IAgendaItem } from '../shared/models/agenda-item.model';

@Injectable({ providedIn: 'root' })
export class SignalingService implements OnDestroy {
  private socket: Socket | null = null;
  private authFlow = inject(AuthFlowService);
  private socketUrl = environment.apiUrl;

  public isConnected = signal(false);

  private userJoined$       = new Subject<string>();
  private userDisconnected$ = new Subject<string>();
  private message$          = new Subject<{ userName: string; message: string; sentAt: string; socketId: string }>();
  private offer$            = new Subject<{ from: string; offer: RTCSessionDescriptionInit }>();
  private answer$           = new Subject<{ from: string; answer: RTCSessionDescriptionInit }>();
  private iceCandidate$     = new Subject<{ from: string; candidate: RTCIceCandidateInit }>();
  private agendaUpdate$      = new Subject<{ currentItem: IAgendaItem; startTime: string; duration: number }>();
  private agendaFinished$    = new Subject<void>();
  private agendaStopped$     = new Subject<void>();
  private agendaItemAdded$   = new Subject<IAgendaItem>();
  private agendaItemDeleted$ = new Subject<string>();
  private fileUploaded$      = new Subject<{ key: string; url: string; originalName: string }>();

  connect(): void {
    const token = this.authFlow.accessToken();
    if (!token) {
      console.error('No se puede conectar al socket sin autenticación.');
      return;
    }

    this.socket = io(this.socketUrl, { auth: { token } });

    this.socket.on('connect',    () => this.isConnected.set(true));
    this.socket.on('disconnect', () => this.isConnected.set(false));

    this.socket.on('user-connected',    (id: string) => this.userJoined$.next(id));
    this.socket.on('user-disconnected', (id: string) => this.userDisconnected$.next(id));
    this.socket.on('message',           (d: any)     => this.message$.next(d));
    this.socket.on('offer',             (d: any)     => this.offer$.next(d));
    this.socket.on('answer',            (d: any)     => this.answer$.next(d));
    this.socket.on('ice-candidate',     (d: any)     => this.iceCandidate$.next(d));
    this.socket.on('agenda-update',       (d: any) => this.agendaUpdate$.next(d));
    this.socket.on('agenda-finished',     ()       => this.agendaFinished$.next());
    this.socket.on('agenda-stopped',      ()       => this.agendaStopped$.next());
    this.socket.on('agenda-item-added',   (d: any) => this.agendaItemAdded$.next(d));
    this.socket.on('agenda-item-deleted', (d: any) => this.agendaItemDeleted$.next(d));
    this.socket.on('file-uploaded',       (d: any) => this.fileUploaded$.next(d));
  }

  getSocketId(): string | undefined {
    return this.socket?.id;
  }

  joinRoom(roomId: string, userName: string): void {
    this.socket?.emit('join-meeting', roomId, userName);
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // --- Presence ---
  onUserJoined():       Observable<string> { return this.userJoined$.asObservable(); }
  onUserDisconnected(): Observable<string> { return this.userDisconnected$.asObservable(); }

  // --- Chat ---
  sendMessage(message: string, userName: string): void {
    this.socket?.emit('message', { message, userName });
  }
  onMessageReceived(): Observable<{ userName: string; message: string; sentAt: string; socketId: string }> {
    return this.message$.asObservable();
  }

  // --- WebRTC ---
  sendOffer(to: string, offer: RTCSessionDescriptionInit): void {
    this.socket?.emit('offer', { to, offer });
  }
  sendAnswer(to: string, answer: RTCSessionDescriptionInit): void {
    this.socket?.emit('answer', { to, answer });
  }
  sendIceCandidate(to: string, candidate: RTCIceCandidateInit): void {
    this.socket?.emit('ice-candidate', { to, candidate });
  }
  onOffer():        Observable<{ from: string; offer: RTCSessionDescriptionInit }>  { return this.offer$.asObservable(); }
  onAnswer():       Observable<{ from: string; answer: RTCSessionDescriptionInit }> { return this.answer$.asObservable(); }
  onIceCandidate(): Observable<{ from: string; candidate: RTCIceCandidateInit }>    { return this.iceCandidate$.asObservable(); }

  // --- Agenda ---
  emitAgendaStart(meetingId: string, firstItemId: string): void {
    this.socket?.emit('agenda-start', { meetingId, firstItemId });
  }
  emitAgendaNext(currentItemId: string, nextItemId: string): void {
    this.socket?.emit('agenda-next', { currentItemId, nextItemId });
  }
  emitAgendaStop(currentItemId: string): void {
    this.socket?.emit('agenda-stop', { currentItemId });
  }
  onAgendaUpdate():      Observable<{ currentItem: IAgendaItem; startTime: string; duration: number }> { return this.agendaUpdate$.asObservable(); }
  onAgendaFinished():    Observable<void>        { return this.agendaFinished$.asObservable(); }
  onAgendaStopped():     Observable<void>        { return this.agendaStopped$.asObservable(); }
  onAgendaItemAdded():   Observable<IAgendaItem> { return this.agendaItemAdded$.asObservable(); }
  onAgendaItemDeleted(): Observable<string>      { return this.agendaItemDeleted$.asObservable(); }
  onFileUploaded():      Observable<{ key: string; url: string; originalName: string }> { return this.fileUploaded$.asObservable(); }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
