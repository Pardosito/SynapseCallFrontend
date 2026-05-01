import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment.development';
import { AuthFlowService } from '../shared/services/auth-flow.service';
import { LocalStorageService } from '../shared/services/local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class SignalingService implements OnDestroy {
  private socket: Socket | null = null;
  private storageService = inject(LocalStorageService);

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

  ngOnDestroy(): void {
    this.disconnect();
  }
}