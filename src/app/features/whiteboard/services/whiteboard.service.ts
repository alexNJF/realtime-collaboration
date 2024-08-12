import { inject, Injectable, signal } from '@angular/core';
import { DropService } from '../sidebar/drop.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import { SocketAction } from '../../../core/enums/socket-status.enum';
import { WebSocketDataModel } from '../../../core/models/socket.model';
import { PointerPositionModel } from '../../../core/models/pointer.model';
import { CdkDragEnd, CdkDragMove, CdkDragStart } from '@angular/cdk/drag-drop';
import { Shape } from '../../../core/models/shape.mpdel';
import { ResizingModel } from '../../../core/models/resizing.model';
import { ResizingStatus } from '../../../core/enums/resizing-status.enum';

@Injectable()
export class WhiteboardService {
    readonly shapes = inject(DropService).shapes;
    readonly #wsService = inject(WebSocketService);

    pointer = signal<PointerPositionModel | undefined>(undefined);
    members = signal<string[]>([]);

    constructor() {
        this.#wsService.messages$.subscribe(
            (msg) => this.handleIncomingMessage(msg)
        );
    }

    joinUser(username: string): void {
        this.#wsService.sendMessage({
            action: SocketAction.MEMBER_CHANGE,
            data: { userId: username }
        })
    }

    handleIncomingMessage(msg: WebSocketDataModel): void {
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
                this.pointer.set(msg.data)
                break;
            case SocketAction.MEMBER_CHANGE:
                this.members.set(msg.data.users)
                break;
        }
    }

    mouseMove(event: MouseEvent, username: string): void {
        this.#wsService.sendMessage({
            action: SocketAction.MOUSE_MOVE,
            data: {
                userId: username,
                coordination: { x: event.x, y: event.y }
            }
        });
    }

    shapeStartDragging(event: CdkDragStart, shapeId: string, username: string): void {
        const shape = this.findShapeById(shapeId);
        if (shape && !shape.lockedBy) {
            this.#wsService.sendMessage({
                action: SocketAction.LOCK,
                data: { shapeId, userId: username }
            });
        }
    }

    shapeStopDragging(event: CdkDragEnd, shapeId: string, username: string): void {
        const shape = this.findShapeById(shapeId);
        if (shape && shape.lockedBy === username) {
            const { x, y } = this.getDragPosition(event);
            shape.x = x;
            shape.y = y;
            this.#wsService.sendMessage({
                action: SocketAction.UPDATE_SHAPE,
                data: shape
            });

            this.#wsService.sendMessage({
                action: SocketAction.UNLOCK,
                data: { shapeId, userId: username }
            });
        }
    }

    shapeDragging(event: CdkDragMove, shapeId: string, username: string): void {
        const shape = this.findShapeById(shapeId);
        if (shape && shape.lockedBy === username) {
            const { x, y } = this.getDragPosition(event);

            this.#wsService.sendMessage({
                action: SocketAction.UPDATE_SHAPE,
                data: { ...shape, x, y }
            });
        }
    }
    
    handelResizing(event: ResizingModel, shapeId: string, username: string): void {
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
                this.#wsService.sendMessage({ action: SocketAction.LOCK, data: { shapeId, userId: username } });
                break;
            case ResizingStatus.STOP_RESIZING:
                this.#wsService.sendMessage({ action: SocketAction.UNLOCK, data: { shapeId, userId: username } });
                break;
            default:
                break;
        }
    }


    // A utility function to find a shape by its ID
    private findShapeById(shapeId: string): Shape | undefined {
        return this.shapes().find((s) => s.id === shapeId);
    }

    // A utility function to get the drag position from the event
    private getDragPosition(
        event: {
            source: {
                getFreeDragPosition: () => { x: number, y: number }
            }
        }): { x: number, y: number } {
        return event.source.getFreeDragPosition();
    }
}