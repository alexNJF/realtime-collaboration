import { CdkDrag, CdkDragEnd, CdkDragHandle, CdkDragMove } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { Component, inject, input, OnInit } from '@angular/core';
import { WebSocketService } from '../../core/services/websocket.service';
import { ResizableDirective } from '../../shared/directives/resizable.directive';
import { BoardStatusComponent } from './board-status/board-status.component';
import { PointerComponent } from './pointer/pointer.component';
import { DropService } from './sidebar/drop.service';
import { SidebarComponent } from './sidebar/sidebar.component';
import { SquareComponent } from './sidebar/square/square.component';
import { TriangleComponent } from './sidebar/triangle/triangle.component';
import { SocketAction } from '../../core/enums/socket-status.enum';




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
    ResizableDirective,
    PointerComponent
  ]
})
export default class WhiteboardComponent implements OnInit {
  username = input.required<string>()
  readonly shapes = inject(DropService).shapes;
  readonly #wsService = inject(WebSocketService);


  isConnected: boolean = true;
  item!: any;
  members: string[] = [];


  ngOnInit() {
    this.#wsService.messages$.subscribe((msg) => this.handleIncomingMessage(msg));
    this.#wsService.connectionStatus$.subscribe((status) => {
      this.isConnected = status;
    });
    this.#wsService.sendMessage({ action: SocketAction.MEMBER_CHANGE, data: { userId: this.username() } })
  }

  onShapeDragStart(shapeId: string) {
    const shape = this.shapes().find((s) => s.id === shapeId);
    if (shape && !shape.lockedBy) {
      this.#wsService.sendMessage({ action: SocketAction.LOCK, data: { shapeId, userId: this.username() } });
    }
  }

  onShapeDragEnd(event: CdkDragEnd<any>, shapeId: string) {
    const shape = this.shapes().find((s) => s.id === shapeId);
    if (shape && shape.lockedBy === this.username()) {

      shape.x = event.source.getFreeDragPosition().x,
        shape.y = event.source.getFreeDragPosition().y,
        console.log(shape);


      this.#wsService.sendMessage({ action: SocketAction.UPDATE_SHAPE, data: shape });
      this.#wsService.sendMessage({ action: SocketAction.UNLOCK, data: { shapeId, userId: this.username() } });
    }
  }

  onShapeDragMove(event: CdkDragMove<any>, shapeId: string) {
    const shape = this.shapes().find((s) => s.id === shapeId);
    const x = event.source.getFreeDragPosition().x
    const y = event.source.getFreeDragPosition().y

    this.#wsService.sendMessage({ action: SocketAction.UPDATE_SHAPE, data: { ...shape, x, y } });
  }
  resizingShape(event: { status: string, width?: number; height?: number }, shapeId: string) {
    switch (event.status) {
      case 'resizing':
        const shape = this.shapes().find((s) => s.id === shapeId);
        if (shape) {
          shape.width = event.width!,
            shape.height = event.height!
          this.#wsService.sendMessage({ action: SocketAction.UPDATE_SHAPE, data: shape });
        }
        break;
      case 'startResizing':
        this.#wsService.sendMessage({ action: SocketAction.LOCK, data: { shapeId, userId: this.username() } });
        break;
      case 'stopResizing':
        this.#wsService.sendMessage({ action: SocketAction.UNLOCK, data: { shapeId, userId: this.username() } });
        break;

      default:
        break;
    }
  }


  handleIncomingMessage(msg: any) {
    switch (msg.action) {
      case SocketAction.LOCK:
        const shapeToLock = this.shapes().find((s) => s.id === msg.data.shapeId);
        if (shapeToLock) {
          shapeToLock.lockedBy = msg.data.userId;
        }
        break;
      case SocketAction.UNLOCK:
        const shapeToUnlock = this.shapes().find((s) => s.id === msg.data.shapeId);
        if (shapeToUnlock && shapeToUnlock.lockedBy === msg.data.userId) {
          shapeToUnlock.lockedBy = undefined;
        }
        break;
      case SocketAction.UPDATE_SHAPE:
        const shapeToUpdate = this.shapes().find((s) => s.id === msg.data.id);
        if (shapeToUpdate) {
          shapeToUpdate.x = msg.data.x;
          shapeToUpdate.y = msg.data.y;
          shapeToUpdate.width = msg.data.width;
          shapeToUpdate.height = msg.data.height;
        }
        break;
      case SocketAction.MOUSE_MOVE:
        this.item = { ...msg.data }
        break;
      case SocketAction.MEMBER_CHANGE:
        this.members = msg.data.users
        break;
    }
  }

  mouseMove(event: MouseEvent) {
    this.#wsService.sendMessage({ action: SocketAction.MOUSE_MOVE, data: { userId: this.username(), coordination: { x: event.x, y: event.y } } });
  }

}
