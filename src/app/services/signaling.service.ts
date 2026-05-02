import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { AuthFlowService } from '../shared/services/auth-flow.service';
import { IAgendaItem } from '../shared/models/agenda-item.model';

@Injectable({
  providedIn: 'root'
})
export class SignalingService implements OnDestroy {
  private socket: Socket | null = null;

  private socketUrl = new URL(environment.apiUrl).origin;
  private authFlow = inject(AuthFlowService);
  public isConnected = signal(false);

  connect(): void {
    const token = this.authFlow.accessToken();

    if (!token) {
      console.error('No se puede conectar al socket sin autenticación.');
      return;
    }

    this.socket = io(this.socketUrl, {
      auth: { token: token }
    });

    this.socket.on('connect', () => {
      console.log('Conectado al servidor de Sockets. ID:', this.socket?.id);
      this.isConnected.set(true);
    });

    this.socket.on('disconnect', () => {
      console.log('Desconectado del servidor de Sockets.');
      this.isConnected.set(false);
    });
  }

  joinRoom(roomId: string, userId: string): void {
    if (this.socket) {
      this.socket.emit('join-meeting', roomId, userId);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  onUserJoined(): Observable<string> {
    return new Observable((observer) => {
      this.socket?.on('user-connected', (userId: string) => {
        console.log(`El usuario ${userId} acaba de entrar a la sala.`);
        observer.next(userId);
      });
    });
  }

  // --- Agenda real-time ---

  emitAgendaStart(meetingId: string, firstItemId: string): void {
    this.socket?.emit('agenda-start', { meetingId, firstItemId });
  }

  emitAgendaNext(currentItemId: string, nextItemId: string): void {
    this.socket?.emit('agenda-next', { currentItemId, nextItemId });
  }

  emitAgendaStop(currentItemId: string): void {
    this.socket?.emit('agenda-stop', { currentItemId });
  }

  onAgendaUpdate(): Observable<{ currentItem: IAgendaItem; startTime: string; duration: number }> {
    return new Observable((observer) => {
      this.socket?.on('agenda-update', (data) => observer.next(data));
    });
  }

  onAgendaFinished(): Observable<void> {
    return new Observable((observer) => {
      this.socket?.on('agenda-finished', () => observer.next());
    });
  }

  onAgendaStopped(): Observable<void> {
    return new Observable((observer) => {
      this.socket?.on('agenda-stopped', () => observer.next());
    });
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
