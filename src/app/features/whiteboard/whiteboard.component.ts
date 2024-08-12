import { CdkDrag, CdkDragEnd, CdkDragHandle, CdkDragMove, CdkDragStart } from '@angular/cdk/drag-drop';
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
import { ResizingStatus } from '../../core/enums/resizing-status.enum';
import { WhiteboardService } from './services/whiteboard.service';




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
  ],
  providers:[WhiteboardService]
})
export default class WhiteboardComponent implements OnInit {
  username = input.required<string>()
  readonly shapes = inject(DropService).shapes;
  readonly #wsService = inject(WebSocketService);
  readonly #whiteboardService = inject(WhiteboardService);
  readonly otherUserPointer =this.#whiteboardService.pointer;
  readonly members =this.#whiteboardService.members;
  

  ngOnInit() {
    this.#whiteboardService.joinUser(this.username())
  }

  onShapeDragStart(event:CdkDragStart,shapeId: string) {
    this.#whiteboardService.shapeStartDragging(
      event,
      shapeId,
      this.username()
    )
  }

  onShapeDragEnd(event: CdkDragEnd<any>, shapeId: string) {
    this.#whiteboardService.shapeStopDragging(
      event,
      shapeId,
      this.username()
    )
  }

  onShapeDragMove(event: CdkDragMove<any>, shapeId: string) {
    this.#whiteboardService.shapeDragging(
      event,
      shapeId,
      this.username()
    )
  }
  resizingShape(event: { status: ResizingStatus, width?: number; height?: number }, shapeId: string) {
    switch (event.status) {
      case ResizingStatus.RESIZING:
        const shape = this.shapes().find((s) => s.id === shapeId);
        if (shape) {
          shape.width = event.width!,
            shape.height = event.height!
          this.#wsService.sendMessage({ action: SocketAction.UPDATE_SHAPE, data: shape });
        }
        break;
      case ResizingStatus.START_RESIZING:
        this.#wsService.sendMessage({ action: SocketAction.LOCK, data: { shapeId, userId: this.username() } });
        break;
      case ResizingStatus.STOP_RESIZING:
        this.#wsService.sendMessage({ action: SocketAction.UNLOCK, data: { shapeId, userId: this.username() } });
        break;

      default:
        break;
    }
  }

  mouseMove(event: MouseEvent) {
    this.#whiteboardService.mouseMove(event,this.username())
  }

}
