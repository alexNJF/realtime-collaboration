import { Component, inject, input } from '@angular/core';
import { WebsocketService } from '../../../core/services/websocket.service';

@Component({
  selector: 'app-board-status',
  standalone: true,
  imports: [],
  templateUrl: './board-status.component.html',
  styleUrl: './board-status.component.scss'
})
export class BoardStatusComponent {
  readonly #wsService = inject(WebsocketService);
  isConnected = input(false)
  resetServer(){
    this.#wsService.sendMessage({action:'resetServer'})
  }
}
