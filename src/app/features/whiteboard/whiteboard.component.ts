import { CdkDrag, CdkDragEnd, CdkDragHandle, CdkDragMove, CdkDragStart } from '@angular/cdk/drag-drop';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, OnInit } from '@angular/core';
import { ResizingModel } from '../../core/models/resizing.model';
import { WebSocketService } from '../../core/services/websocket.service';
import { ResizableDirective } from '../../shared/directives/resizable.directive';
import { BoardStatusComponent } from './board-status/board-status.component';
import { PointerComponent } from './pointer/pointer.component';
import { WhiteboardService } from './services/whiteboard.service';
import { DropService } from './sidebar/drop.service';
import { RhombusComponent } from './sidebar/rhombus/rhombus.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { SquareComponent } from './sidebar/square/square.component';
import { TextboxComponent } from './sidebar/textbox/textbox.component';




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
    RhombusComponent,
    BoardStatusComponent,
    ResizableDirective,
    PointerComponent,
    TextboxComponent
  ],
  providers: [WhiteboardService],
})
export default class WhiteboardComponent implements OnInit {
  username = input.required<string>()
  readonly shapes = inject(DropService).shapes;
  private readonly whiteboardService = inject(WhiteboardService);
  readonly otherUserPointer = this.whiteboardService.pointer;
  readonly members = this.whiteboardService.members;


  ngOnInit() {
    this.whiteboardService.joinUser(this.username())
  }

  onShapeDragStart(event: CdkDragStart, shapeId: string) {
    this.whiteboardService.shapeStartDragging(
      event,
      shapeId,
      this.username()
    )
  }

  onShapeDragEnd(event: CdkDragEnd<any>, shapeId: string) {
    this.whiteboardService.shapeStopDragging(
      event,
      shapeId,
      this.username()
    )
  }

  onShapeDragMove(event: CdkDragMove<any>, shapeId: string) {
    this.whiteboardService.shapeDragging(
      event,
      shapeId,
      this.username()
    )
  }

  resizingShape(event: ResizingModel, shapeId: string) {
    this.whiteboardService.handelResizing(
      event,
      shapeId,
      this.username()
    )
  }

  mouseMove(event: MouseEvent) {
    this.whiteboardService.mouseMove(event, this.username())
  }

  shapeTextChange(event: string, shapeId: string) {
    this.whiteboardService.handelTextChange(
      event,
      shapeId,
      this.username()
    )

  }
  shapeColorChange(event: string, shapeId: string) {
    this.whiteboardService.handelColorChange(
      event,
      shapeId,
      this.username()
    )
  }

}
