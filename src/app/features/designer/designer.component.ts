import { Component, inject, input, OnInit } from '@angular/core';
import { WebSocketService } from '../../core/services/web-socket.service';
import { CommonModule, JsonPipe } from '@angular/common';

@Component({
  selector: 'app-designer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './designer.component.html',
  styleUrl: './designer.component.scss',
})
export default class DesignerComponent {

  readonly #webSocketService = inject(WebSocketService);
  readonly others = this.#webSocketService.socket;

  username = input.required()
  sendMessage(event: MouseEvent) {
    if (this.#webSocketService.socket().status === WebSocket.OPEN) {
      this.#webSocketService.sendMessage(JSON.stringify(
        {
          username:this.username(),
          cordination: { x: event.clientX, y: event.clientY }
        }
      ))
    }
  }

  closeSocket() {
    this.#webSocketService.close()
  }

  startListening() {
    this.#webSocketService.connect();
    this.#webSocketService.listen()
  }
}
