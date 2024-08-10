import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, input, output, ViewChild } from '@angular/core';

@Component({
  selector: 'app-draggable-div',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './draggable-div.component.html',
  styleUrl: './draggable-div.component.scss'
})
export class DraggableDivComponent {
  isLock = input(false)
  elementChangeing = output<any>()

  private isDragging = false;
  private isResizing = false;
  private initialX = 0;
  private initialY = 0;
  private currentX = 0;
  private currentY = 0;
  private initialWidth = 0;
  private initialHeight = 0;

  @ViewChild('draggableDiv') draggableDiv!: ElementRef;

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    if (this.isLock()) {
      return
    }
    const target = event.target as HTMLElement;
    if (target.classList.contains('draggable-header')) {
      this.isDragging = true;
      this.initialX = event.clientX;
      this.initialY = event.clientY;
    } else if (target.classList.contains('resize-handle')) {
      this.isResizing = true;
      this.initialX = event.clientX;
      this.initialY = event.clientY;
      this.initialWidth = this.draggableDiv.nativeElement.clientWidth;
      this.initialHeight = this.draggableDiv.nativeElement.clientHeight;
    }
  }

  @HostListener('mouseup', ['$event'])
  onMouseUp() {
    this.isDragging = false;
    this.isResizing = false;
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.isDragging) {
      this.currentX = event.clientX;
      this.currentY = event.clientY;

      const deltaX = this.currentX - this.initialX;
      const deltaY = this.currentY - this.initialY;

      this.draggableDiv.nativeElement.style.left = `${this.draggableDiv.nativeElement.offsetLeft + deltaX}px`;
      this.draggableDiv.nativeElement.style.top = `${this.draggableDiv.nativeElement.offsetTop + deltaY}px`;

      this.initialX = this.currentX;
      this.initialY = this.currentY;
    } else if (this.isResizing) {
      const deltaX = event.clientX - this.initialX;
      const deltaY = event.clientY - this.initialY;
      this.draggableDiv.nativeElement.style.width = `${this.initialWidth + deltaX}px`;
      this.draggableDiv.nativeElement.style.height = `${this.initialHeight + deltaY}px`;
    }

    this.emitChanges();

  }

  emitChanges(){
    if(this.isDragging || this.isResizing){

      this.elementChangeing.emit({
        isDragging: this.isDragging,
        isResizing: this.isResizing,
        initialX: this.initialX,
        initialY: this.initialY,
        currentX: this.currentX,
        currentY: this.currentY,
        initialWidth: this.initialWidth,
        initialHeight: this.initialHeight,
      })
    }
  }


}
