import { CdkDrag, CdkDragEnd, CdkDragMove, CdkDragStart } from '@angular/cdk/drag-drop';
import { NgStyle } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-temp',
  standalone: true,
  imports: [CdkDrag,NgStyle],
  templateUrl: './temp.component.html',
  styleUrl: './temp.component.scss'
})
export class TempComponent {
  coordination = {
    x: 100,
    y: 200
  };


  onShapeDragStart(event:CdkDragStart) {
    console.log('Drag started');
  }

  onShapeDragEnd(event: CdkDragEnd<any>) {
    // Finalize the coordination after drag ends
    this.coordination = {
      x: event.source.getFreeDragPosition().x,
      y: event.source.getFreeDragPosition().y
    };
    console.log('Drag ended at:', this.coordination);
  }

  onShapeDragMove(event: CdkDragMove<any>) {
    // const { x, y } = event.pointerPosition;
    // // Calculate the delta movement from the last position
    // const deltaX = x - event.source.element.nativeElement.getBoundingClientRect().left;
    // const deltaY = y - event.source.element.nativeElement.getBoundingClientRect().top;
    
    // // Update the coordination based on the delta movement
    // this.coordination = {
    //   x: event.source.element.nativeElement.getBoundingClientRect().left,
    //   y: event.source.element.nativeElement.getBoundingClientRect().top
    // };

    // console.log('Drag moved:',  event.pointerPosition);
    console.log('element:', 
       event.source.element.nativeElement.getBoundingClientRect().left,
       event.source.element.nativeElement.getBoundingClientRect().top);

  }

}
