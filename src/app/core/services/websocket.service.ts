import { computed, Injectable, signal } from '@angular/core';
import { Observable, Subject, timer } from 'rxjs';
import { retry, switchMap } from 'rxjs/operators';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { WEB_SOCKET_URL } from '../configs/websocket.config';
import { WebSocketDataModel } from '../models/socket.model';
import { SocketAction } from '../enums/socket-status.enum';
import { mergeWithPriority } from '../../shared/utils/array';

@Injectable({
  providedIn: 'root',
})
export class WebSocketService {
  private socket$!: WebSocketSubject<WebSocketDataModel>;
  private readonly maxReconnectAttempts = 5;
  private reconnectAttemptsCounter = signal(0);
  connectionStatus = signal<boolean>(false);
  private messagesSubject$ = new Subject<WebSocketDataModel>();
  private offlineChanges: WebSocketDataModel[] = [];


  retryStatus = computed<string>(() => {
    const attempts = this.reconnectAttemptsCounter();
    return attempts >= this.maxReconnectAttempts
      ? 'Maximum reconnect attempts reached (Please Refresh the Page for Reconnecting)'
      : `Connection lost. Attempting to reconnect... (${attempts})`;
  });

  constructor() {
    this.connect()
  }

  /**
   * Establishes a WebSocket connection to the specified URL.
   *
   * If the connection is already established, it logs a warning and returns.
   * Otherwise, it sets up a retry mechanism with a specified number of attempts
   * and delay between attempts. Once connected, it sets the connection status to true.
   *
   * @return {void}
   */
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

  /**
   * Handles the retry logic for WebSocket connection attempts.
   *
   * @param {any} error - The error that occurred during the connection attempt.
   * @param {number} retryCount - The current number of retry attempts.
   * @return {Observable<number>} An Observable that delays the next retry attempt.
   */
  private handleRetry(error: any, retryCount: number): Observable<number> {
    this.reconnectAttemptsCounter.update((count) => count + 1);
    this.connectionStatus.set(false);

    if (this.reconnectAttemptsCounter() >= this.maxReconnectAttempts) {
      console.error('Maximum reconnect attempts reached');
      throw error; // Stop retrying after max attempts
    }

    return timer(1000 * retryCount); // Use timer to return an Observable
  }

  /**
   * Handles incoming WebSocket messages.
   *
   * @param {WebSocketDataModel} message - The WebSocket message received.
   * @return {void} This function does not return anything.
   */
  private handleIncomingMessage(message: WebSocketDataModel): void {
    console.log('Received message:', message);
    if (
      message.action === SocketAction.INITIAL_STATE_UPDATE &&
      this.offlineChanges.length > 0
    ) {
      this.syncOfflineChanges(message.data.shapes)
    }
    this.connectionStatus.set(true);
    this.reconnectAttemptsCounter.set(0);
    this.messagesSubject$.next(message);
  }

  
  /**
   * Resolves conflicts by merging offline changes with the provided data, prioritizing by 'id'.
   *
   * @param {any[]} data - The data to merge with offline changes.
   * @return {void} This function does not return a value.
   */
  syncOfflineChanges(data: any[]) {
    if (this.connectionStatus()) {
      const mergedResult = mergeWithPriority(data, this.offlineChanges, 'id')
      while (mergedResult.length > 0) {
        const change = mergedResult.shift();
        if (change) {
          this.sendMessage(change);
        }
      }
    }
  }

  private handleConnectionError(error: any): void {
    console.error('WebSocket error:', error);
  }

  private handleConnectionComplete(): void {
    console.log('WebSocket connection closed');
  }

  /**
   * Sends a WebSocket message to the server if the connection is active, 
   * otherwise stores the message for later synchronization.
   *
   * @param {WebSocketDataModel} msg - The message to be sent to the server.
   * @return {void} This function does not return a value.
   */
  sendMessage(msg: WebSocketDataModel): void {
    if (this.connectionStatus()) {
      this.socket$.next(msg);
    } else {
      console.warn('Offline: Storing change for later sync');
      // in offline mode we just save important data
      if (
        msg.action === SocketAction.ADD_SHAPE ||
        msg.action === SocketAction.UPDATE_SHAPE
      ) {
        this.offlineChanges.push(msg);
      }
    }
  }

  /**
   * Retrieves the observable stream of WebSocket messages.
   *
   * @return {Observable<WebSocketDataModel>} The observable stream of WebSocket messages.
   */
  get messages$(): Observable<WebSocketDataModel> {
    return this.messagesSubject$.asObservable();
  }
}
