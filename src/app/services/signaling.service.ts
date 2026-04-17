import { Injectable, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment.development'; //TODO: Hay que cambiar a la de prod ya que terminemos el desarrollo

@Injectable({
  providedIn: 'root'
})
export class SignalingService {
  private socket!: Socket;

  public chatMessages = signal<any[]>([]);

  joinRoom(roomId: string, userId: string) {
    this.socket = io(environment.apiUrl);
    this.socket.emit('join-room', { roomId, userId });
    this.socket.on('user-connected', (newUserId) => {
      console.log('Un nuevo participante entró con el ID:', newUserId);
    });

    this.socket.on('receive-message', (message) => {
      this.chatMessages.update(msgs => [...msgs, message]);
    });
  }

  sendChatMessage(roomId: string, message: string) {
    this.socket.emit('send-message', { roomId, message });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}