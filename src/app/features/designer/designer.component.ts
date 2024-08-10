import { AfterViewInit, Component, ElementRef, HostListener, inject, input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { WebSocketService } from '../../core/services/web-socket.service';
import { CommonModule, JsonPipe, KeyValue } from '@angular/common';
import { DraggableDivComponent } from './draggable-div/draggable-div.component';
import { SidebarComponent } from '../whiteboard/sidebar/sidebar.component';

@Component({
  selector: 'app-designer',
  standalone: true,
  imports: [CommonModule, DraggableDivComponent, SidebarComponent],
  templateUrl: './designer.component.html',
  styleUrl: './designer.component.scss',
})
export default class DesignerComponent implements OnInit {


  readonly #webSocketService = inject(WebSocketService);
  readonly others = this.#webSocketService.socket;

  username = input.required<string>()

  ngOnInit(): void {
    this.#webSocketService.webSocket.onopen = () => {
      this.#webSocketService.webSocket.send(JSON.stringify(
        {
          op: 'usernameAdd',
          username: this.username(),
        }
      ))
    };
  }

  sendMessage(event: MouseEvent) {
    if (this.#webSocketService.socket().status === WebSocket.OPEN) {
      this.#webSocketService.sendMessage(JSON.stringify(
        {
          op: 'mouseMove',
          username: this.username(),
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


  sortByValueAsc = (a: KeyValue<string, any>, b: KeyValue<string, any>) => {
    return 0
  };

  elementChangeing(event: any) {
    console.log('elementChange: ', event);
  }
}
