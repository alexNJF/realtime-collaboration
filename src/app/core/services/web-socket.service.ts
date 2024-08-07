import { Injectable, signal } from '@angular/core';
import { WEB_SOCKET_URL } from '../configs/websocket.config';
import { WebSocketModel } from '../models/socket.model';

@Injectable({ providedIn: 'root' })
export class WebSocketService {
    #webSocket!: WebSocket;
    readonly socket = signal<WebSocketModel>({
        status: WebSocket.CLOSED
    })

    constructor() {
        this.connect();
        this.listen();
    }
    
    close() {
        this.#webSocket.close();
    }
    
    connect() {
        this.#webSocket = new WebSocket(WEB_SOCKET_URL);
    }

    listen() {
        this.#webSocket.onopen = () => {
            console.log('On Open WebSocket', this.#webSocket.readyState);
            this.setSocket(this.#webSocket.readyState)
        };

        this.#webSocket.onmessage = (event) => {
            const message = event.data;
            console.log('On Masssage WebSocket', this.#webSocket.readyState);
            console.log('On Massage Received message:', message);
            this.setSocket(this.#webSocket.readyState,JSON.parse(message))

        };

        this.#webSocket.onerror = (error) => {
            console.log('On Error WebSocket', this.#webSocket.readyState);
            console.log('On Error :', error);
            this.setSocket(this.#webSocket.readyState, undefined, error)
        };

        this.#webSocket.onclose = () => {
            console.log('On Close WebSocket', this.#webSocket.readyState);
            this.setSocket(this.#webSocket.readyState)
        };
    }

    sendMessage(message: any) {
        this.#webSocket.send(message);
    }

    private setSocket(status: number = WebSocket.CLOSED, data: any = undefined, error: any = undefined) {
        this.socket.set(
            {
                status,
                data,
                error
            })
    }
}