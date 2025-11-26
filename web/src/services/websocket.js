import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'https://phuntroo-ai-proxy.sudhir1100200426.workers.dev';

class WebSocketService {
    constructor() {
        this.socket = null;
        this.listeners = new Map();
    }

    connect() {
        if (this.socket?.connected) {
            return;
        }

        this.socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        this.socket.on('connect', () => {
            console.log('WebSocket connected:', this.socket.id);
            this.emit('connected', { socketId: this.socket.id });
        });

        this.socket.on('disconnect', () => {
            console.log('WebSocket disconnected');
            this.emit('disconnected');
        });

        this.socket.on('response', (data) => {
            this.emit('response', data);
        });

        this.socket.on('error', (error) => {
            console.error('WebSocket error:', error);
            this.emit('error', error);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    send(event, data) {
        if (this.socket?.connected) {
            this.socket.emit(event, data);
        } else {
            console.warn('WebSocket not connected');
        }
    }

    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => callback(data));
        }
    }

    isConnected() {
        return this.socket?.connected || false;
    }
}

const websocketService = new WebSocketService();

export default websocketService;
