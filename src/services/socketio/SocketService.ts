import { io, Socket } from 'socket.io-client';
import config from './config';

class SocketService {
  private socket: Socket | null;
  private isConnected: boolean;

  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(serverUrl = config.SOCKET_URL) {
    this.socket = io(serverUrl);

    this.socket.on('connect', () => {
      this.isConnected = true;
    });

this.socket.on('disconnect', () => {
  this.isConnected = false;
});

return this.socket;
  }

  joinLocationRoom(location: string) {
    if (this.socket) {
      this.socket.emit('joinLocationRoom', location);
    }
  }

  leaveLocationRoom(location: string) {
    if (this.socket) {
      this.socket.emit('leaveLocationRoom', location);
    }
  }

  onServiceRequest(callback: (data: unknown) => void) {
    if (this.socket) {
      this.socket.on('serviceRequest', callback);
    }
  }

  onProviderNotification(callback: (data: unknown) => void) {
    if (this.socket) {
      this.socket.on('providerNotification', callback);
    }
  }

  onRequestAccepted(callback: (data: unknown) => void) {
    if (this.socket) {
      this.socket.on('requestAccepted', callback);
    }
  }

  joinProviderRoom(providerId: string) {
    if (this.socket) {
      this.socket.emit('joinProviderRoom', providerId);
    }
  }

  joinCustomerRoom(customerId: string) {
    if (this.socket) {
      this.socket.emit('joinCustomerRoom', customerId);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }
}

const socketService = new SocketService();
export default socketService;