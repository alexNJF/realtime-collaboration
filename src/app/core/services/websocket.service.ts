import { computed, Injectable, signal } from '@angular/core';
import { Observable, Subject, timer } from 'rxjs';
import { retry, switchMap } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { WEB_SOCKET_URL } from '../configs/websocket.config';
import { WebSocketDataModel } from '../models/socket.model';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket$!: WebSocketSubject<WebSocketDataModel>;
  private readonly maxReconnectAttempts = 5;
  private reconnectAttemptsCounter = signal(0);
  connectionStatus = signal<boolean>(false);
  private messagesSubject$ = new Subject<WebSocketDataModel>();

  retryStatus = computed<string>(() => {
    const attempts = this.reconnectAttemptsCounter();
    return attempts >= this.maxReconnectAttempts
      ? 'Maximum reconnect attempts reached (Please Refresh the Page for Reconnecting)'
      : `Connection lost. Attempting to reconnect... (${attempts})`;
  });

  constructor() {
    this.connect()
  }

  connect(): void {
    if (this.connectionStatus()) {
      console.warn('WebSocket is already connected.');
      return;
    }

    this.socket$ = webSocket<WebSocketDataModel>(WEB_SOCKET_URL);

    this.socket$
      .pipe(
        retry({
          count: this.maxReconnectAttempts,
          delay: (error, retryCount) => this.handleRetry(error, retryCount),
        })
      )
      .subscribe({
        next: (message) => this.handleIncomingMessage(message),
        error: (error) => this.handleConnectionError(error),
        complete: () => this.handleConnectionComplete(),
      });

    this.connectionStatus.set(true);
  }

  disconnect(): void {
    if (!this.connectionStatus()) {
      console.warn('WebSocket is not connected.');
      return;
    }

    this.socket$.complete();
    this.connectionStatus.set(false);
    console.log('WebSocket connection manually closed');
  }

  private handleRetry(error: any, retryCount: number): Observable<number> {
    this.reconnectAttemptsCounter.update((count) => count + 1);
    this.connectionStatus.set(false);

    if (this.reconnectAttemptsCounter() >= this.maxReconnectAttempts) {
      console.error('Maximum reconnect attempts reached');
      throw error; // Stop retrying after max attempts
    }

    return timer(1000 * retryCount); // Use timer to return an Observable
  }

  private handleIncomingMessage(message: WebSocketDataModel): void {
    console.log('Received message:', message);
    this.connectionStatus.set(true);
    this.reconnectAttemptsCounter.set(0);
    this.messagesSubject$.next(message); // Emit the message through the subject
  }

  private handleConnectionError(error: any): void {
    console.error('WebSocket error:', error);
  }

  private handleConnectionComplete(): void {
    console.log('WebSocket connection closed');
  }

  sendMessage(msg: WebSocketDataModel): void {
    if (this.connectionStatus()) {
      this.socket$.next(msg);
    } else {
      console.error('WebSocket is not connected. Cannot send message.');
    }
  }

  get messages$(): Observable<WebSocketDataModel> {
    return this.messagesSubject$.asObservable();
  }
}
