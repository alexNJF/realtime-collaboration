import { TitleCasePipe } from '@angular/common';
import { Component, inject, input, OnInit, signal } from '@angular/core';
import { WebSocketService } from '../../../core/services/websocket.service';
import { SocketAction } from '../../../core/enums/socket-status.enum';

@Component({
  selector: 'app-board-status',
  standalone: true,
  imports: [TitleCasePipe],
  templateUrl: './board-status.component.html',
  styleUrl: './board-status.component.scss'
})
export class BoardStatusComponent {
  readonly #wsService = inject(WebSocketService);
  retryStatus=this.#wsService.retryStatus;
  connectionStatus=this.#wsService.connectionStatus;
  isConnected =signal(false)
  username = input.required()
  members = input.required<string[]>()
  
  resetServer():void{
    this.#wsService.sendMessage({action:SocketAction.RESET_SERVER})
  }
}
