import { TitleCasePipe } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { WebSocketService } from '../../../core/services/websocket.service';

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
  isConnected = input(false)
  username = input.required()
  members = input.required<string[]>()
  
  resetServer():void{
    this.#wsService.sendMessage({action:'resetServer'})
  }
}
