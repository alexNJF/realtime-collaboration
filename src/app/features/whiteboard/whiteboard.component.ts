import { CdkDrag, CdkDragDrop, CdkDragEnd, CdkDragHandle, CdkDragMove } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit } from '@angular/core';
import { Shape } from '../../core/models/shape.mpdel';
import { WebsocketService } from '../../core/services/websocket.service';
import { SidebarComponent } from './sidebar/sidebar.component';
import { SquareComponent } from './sidebar/square/square.component';
import { TriangleComponent } from './sidebar/triangle/triangle.component';
import { DropService } from './sidebar/drop.service';
import { BoardStatusComponent } from './board-status/board-status.component';
import { generateUniqueId } from '../../shared/utils/generator';
import { ResizableDirective } from '../../shared/directives/resizable.directive';




@Component({
  standalone: true,
  selector: 'app-whiteboard',
  templateUrl: './whiteboard.component.html',
  styleUrls: ['./whiteboard.component.scss'],
  imports: [
    CommonModule,
    CdkDrag,
    CdkDragHandle,
    SidebarComponent,
    SquareComponent,
    TriangleComponent,
    BoardStatusComponent,
    ResizableDirective
  ]
})
export default class WhiteboardComponent implements OnInit {
  readonly shapes = inject(DropService).shapes;
  readonly #wsService = inject(WebsocketService);

  username = input()
  isConnected: boolean = true;
  item!: any;

  ngOnInit() {
    this.#wsService.messages$.subscribe((msg) => this.handleIncomingMessage(msg));
    this.#wsService.connectionStatus.subscribe((status) => {
      this.isConnected = status;
    });
  }

  onShapeDragStart(shapeId: string) {
    const shape = this.shapes().find((s) => s.id === shapeId);
    if (shape && !shape.lockedBy) {
      this.#wsService.sendMessage({ action: 'lock', data: { shapeId, userId: this.username() } });
    }
  }

  onShapeDragEnd(event: CdkDragEnd<any>, shapeId: string) {
    const shape = this.shapes().find((s) => s.id === shapeId);
    if (shape && shape.lockedBy === this.username()) {

      // shape.x = event.dropPoint.x;
      // shape.y = event.dropPoint.y;      
      // this.#wsService.sendMessage({ action: 'updateShape', data: { ...shape, x: event.dropPoint.x, y: event.dropPoint.y } });
      this.#wsService.sendMessage({ action: 'unlock', data: { shapeId, userId: this.username() } });
    }
  }

  onShapeDragMove(event: CdkDragMove<any>, shape: Shape) {
    this.#wsService.sendMessage({ action: 'updateShape', data: { ...shape, x: event.pointerPosition.x, y: event.pointerPosition.y } });
  }
  resizingShape(event: { status: string, width?: number; height?: number }, shape: Shape) {
    switch (event.status) {
      case 'resizing':
        this.#wsService.sendMessage({ action: 'updateShape', data: { ...shape, width: event.width, height: event.height } });
        break;
      case 'startResizing':
        this.#wsService.sendMessage({ action: 'lock', data: { shapeId: shape.id, userId: this.username() } });
        break;
      case 'stopResizing':
        this.#wsService.sendMessage({ action: 'unlock', data: { shapeId: shape.id, userId: this.username() } });
        break;

      default:
        break;
    }
  }


  handleIncomingMessage(msg: any) {
    switch (msg.action) {
      case 'lock':
        const shapeToLock = this.shapes().find((s) => s.id === msg.data.shapeId);
        if (shapeToLock) {
          shapeToLock.lockedBy = msg.data.userId;
        }
        break;
      case 'unlock':
        const shapeToUnlock = this.shapes().find((s) => s.id === msg.data.shapeId);
        if (shapeToUnlock && shapeToUnlock.lockedBy === msg.data.userId) {
          shapeToUnlock.lockedBy = undefined;
        }
        break;
      case 'updateShape':
        const shapeToUpdate = this.shapes().find((s) => s.id === msg.data.id);
        if (shapeToUpdate) {
          shapeToUpdate.x = msg.data.x;
          shapeToUpdate.y = msg.data.y;
          shapeToUpdate.width = msg.data.width;
          shapeToUpdate.height = msg.data.height;
        }
        break;
      case 'mouseMove':
        this.item = { ...msg.data }
        break;
    }
  }

  mouseMove(event: MouseEvent) {
    this.#wsService.sendMessage({ action: 'mouseMove', data: { userId: this.username(), coordination: { x: event.x, y: event.y } } });
  }

}
