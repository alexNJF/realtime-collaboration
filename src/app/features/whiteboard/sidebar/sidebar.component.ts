import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { Component, inject } from '@angular/core';
import { DropService } from './drop.service';
import { RhombusComponent } from './rhombus/rhombus.component';
import { SquareComponent } from './square/square.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [DragDropModule, SquareComponent, RhombusComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  readonly #dropService = inject(DropService)
  drop(event: CdkDragDrop<any>) {
    this.#dropService.drop(event)
  }
}
