import { Injectable, computed, signal } from '@angular/core';
import { Observable, Subject, timer } from 'rxjs';
import { retry } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { WEB_SOCKET_URL } from '../configs/websocket.config';
import { WebSocketDataModel } from '../models/socket.model';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket$!: WebSocketSubject<WebSocketDataModel>;
  // private connectionStatusSubject: Subject<boolean> = new Subject<boolean>();
  private readonly maxReconnectAttempts = 5;
  private reconnectAttemptsCounter = signal(0);
  connectionStatus = signal(false);

  retryStatus = computed(() => {
    const attempts = this.reconnectAttemptsCounter();
    return attempts >= this.maxReconnectAttempts
      ? 'Maximum reconnect attempts reached (Please Refresh the Page for Reconnecting)'
      : `Connection lost. Attempting to reconnect... (${attempts})`;
  });

  constructor() {
    this.initializeWebSocketConnection();
  }

  private initializeWebSocketConnection(): void {
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
  }

  private handleRetry(error: any, retryCount: number): Observable<number> {
    this.reconnectAttemptsCounter.update((count) => count + 1);
    console.log(`Reconnecting... (${this.reconnectAttemptsCounter()})`);
    // this.connectionStatusSubject.next(false);
    this.connectionStatus.set(false)
    
    if (this.reconnectAttemptsCounter() >= this.maxReconnectAttempts) {
      console.error('Maximum reconnect attempts reached');
      // this.connectionStatusSubject.next(false);
      this.connectionStatus.set(false)
      throw error; // Stop retrying after max attempts
    }

    return timer(1000 * retryCount); // Use timer to return an Observable
  }

  private handleIncomingMessage(message: WebSocketDataModel): void {
    if (message.action === 'updateShape') {
      console.log('Received message: ', message.data);
    }
    // this.connectionStatusSubject.next(true);
    this.connectionStatus.set(true)
    this.reconnectAttemptsCounter.set(0);
  }

  private handleConnectionError(error: any): void {
    console.error('WebSocket error:', error);
  }

  private handleConnectionComplete(): void {
    console.log('WebSocket connection closed');
  }

  sendMessage(msg: WebSocketDataModel): void {
    this.socket$.next(msg);
  }

  get messages$(): Observable<WebSocketDataModel> {
    return this.socket$.asObservable();
  }

  // get connectionStatus$(): Observable<boolean> {
  //   return this.connectionStatusSubject.asObservable();
  // }
}
