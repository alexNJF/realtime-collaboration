import { TestBed } from '@angular/core/testing';
import { WhiteboardService } from './whiteboard.service';
import { DropService } from '../sidebar/drop.service';
import { WebSocketService } from '../../../core/services/websocket.service';
import { SocketAction } from '../../../core/enums/socket-status.enum';
import { WebSocketDataModel } from '../../../core/models/socket.model';
import { of } from 'rxjs';
import { CdkDragEnd, CdkDragMove, CdkDragStart } from '@angular/cdk/drag-drop';
import { PointerPositionModel } from '../../../core/models/pointer.model';
import { Shape } from '../../../core/models/shape.mpdel';

describe('WhiteboardService', () => {
    let service: WhiteboardService;
    let mockWebSocketService: jasmine.SpyObj<WebSocketService>;
    let mockDropService: jasmine.SpyObj<DropService>;

    beforeEach(() => {
        mockWebSocketService = jasmine.createSpyObj('WebSocketService', ['sendMessage'], {
            messages$: of<WebSocketDataModel>(),
        });
        
        mockDropService = jasmine.createSpyObj('DropService', ['shapes'], {
            shapes: jasmine.createSpy().and.returnValue([
                { id: 'shape1', lockedBy: undefined, x: 0, y: 0, width: 100, height: 100 },
                { id: 'shape2', lockedBy: 'user-1', x: 0, y: 0, width: 100, height: 100 },
            ] as Shape[]),
        });

        TestBed.configureTestingModule({
            providers: [
                WhiteboardService,
                { provide: WebSocketService, useValue: mockWebSocketService },
                { provide: DropService, useValue: mockDropService },
            ],
        });

        service = TestBed.inject(WhiteboardService);
    });

    it('should send a MEMBER_CHANGE message when joinUser is called', () => {
        const username = 'testUser';
        service.joinUser(username);

        expect(mockWebSocketService.sendMessage).toHaveBeenCalledWith({
            action: SocketAction.MEMBER_CHANGE,
            data: { userId: username },
        });
    });

    it('should lock a shape on LOCK action', () => {
        const shapeId = 'shape1';
        const userId = 'user1';

        const msg: WebSocketDataModel = {
            action: SocketAction.LOCK,
            data: { shapeId, userId },
        };

        service.handleIncomingMessage(msg);

        const shape = mockDropService.shapes().find((s) => s.id === shapeId);
        expect(shape?.lockedBy).toBe(userId);
    });

    it('should send a MOUSE_MOVE message with correct coordinates', () => {
        const event = { x: 150, y: 200 } as MouseEvent;
        const username = 'testUser';

        service.mouseMove(event, username);

        expect(mockWebSocketService.sendMessage).toHaveBeenCalledWith({
            action: SocketAction.MOUSE_MOVE,
            data: {
                userId: username,
                coordination: { x: event.x, y: event.y },
            },
        });
    });

    it('should send a LOCK message when shapeStartDragging is called if the shape is not locked', () => {
        const shapeId = 'shape1';
        const username = 'testUser';
        const event = {} as CdkDragStart;

        service.shapeStartDragging(event, shapeId, username);

        expect(mockWebSocketService.sendMessage).toHaveBeenCalledWith({
            action: SocketAction.LOCK,
            data: { shapeId, userId: username },
        });
    });

    it('should send an UPDATE_SHAPE and UNLOCK message when shapeStopDragging is called', () => {
        const shapeId = 'shape1';
        const username = 'testUser';
        const event = {
            source: {
                getFreeDragPosition: () => ({ x: 300, y: 400 }),
            },
        } as CdkDragEnd;

        const shape = mockDropService.shapes().find((s) => s.id === shapeId);
        if (shape) {
            shape.lockedBy = username; // Simulate the shape being locked by the user
        }

        service.shapeStopDragging(event, shapeId, username);

        expect(mockWebSocketService.sendMessage).toHaveBeenCalledWith({
            action: SocketAction.UPDATE_SHAPE,
            data: { ...shape, x: 300, y: 400 },
        });

        expect(mockWebSocketService.sendMessage).toHaveBeenCalledWith({
            action: SocketAction.UNLOCK,
            data: { shapeId, userId: username },
        });
    });
});
