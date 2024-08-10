import { Injectable } from '@angular/core';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { Subject, Observable, of } from 'rxjs';
import { retryWhen, delay, tap, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class WebsocketService {
  private socket$!: WebSocketSubject<any>;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 10;
  private connectionStatus$: Subject<boolean> = new Subject<boolean>();

  constructor() {
    this.connect();
  }

  private connect() {
    this.socket$ = webSocket('ws://localhost:8080');

    this.socket$.pipe(
      retryWhen((errors) =>
        errors.pipe(
          tap(() => {
            this.reconnectAttempts++;
            console.log(`Reconnecting... (${this.reconnectAttempts})`);
            this.connectionStatus$.next(false);
          }),
          delay(1000 * this.reconnectAttempts), // Exponential backoff
          tap(() => {
            if (this.reconnectAttempts >= this.maxReconnectAttempts) {
              console.error('Maximum reconnect attempts reached');
              // Optionally notify the user
              this.connectionStatus$.next(false);
            }
          })
        )
      )
    ).subscribe(
      (message) => {
        console.log('Received message: ', message);
        this.connectionStatus$.next(true);
      },
      (error) => {
        console.error('WebSocket error:', error);
      }
    );
  }

  sendMessage(msg: any) {
    this.socket$.next(msg);
  }

  get messages$(): Observable<any> {
    return this.socket$.asObservable();
  }

  get connectionStatus(): Observable<boolean> {
    return this.connectionStatus$.asObservable();
  }
}