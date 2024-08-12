import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { inject, Injectable, signal } from '@angular/core';
import { Shape } from '../../../core/models/shape.mpdel';
import { generateUniqueId } from '../../../shared/utils/generator';
import { WebSocketService } from '../../../core/services/websocket.service';
import { SocketAction } from '../../../core/enums/socket-status.enum';

@Injectable({ providedIn: 'root' })
export class DropService {
    readonly #wsService = inject(WebSocketService);
    constructor(){
        this.checkForInitialState();
        this.checkForAddShape();
    }

    shapes = signal<Shape[]>([]);
   
    drop(event: CdkDragDrop<any>) {
        const shape = {
            id: generateUniqueId(),
            type:event.item.element.nativeElement.attributes[1].name,
            x: event.dropPoint.x,
            y: event.dropPoint.y,
            width: 100,
            height: 100
        }
        this.shapes.update((shapes)=>{
            shapes.push(shape)
            return shapes;
        })
        this.#wsService.sendMessage({ action: SocketAction.ADD_SHAPE, data: shape })
    }
    
    checkForInitialState():void{
        this.#wsService.messages$.subscribe(msg=>{
            if(msg.action===SocketAction.INITIAL_STATE_UPDATE){                
                this.shapes.set(msg.data.shapes)
            }
        })
    }
    checkForAddShape():void{
        this.#wsService.messages$.subscribe(msg=>{
            if(msg.action===SocketAction.ADD_SHAPE){                
                this.shapes.update((shapes)=>{
                    shapes.push(msg.data)
                    return shapes;
                })
            }
        })
    }
}