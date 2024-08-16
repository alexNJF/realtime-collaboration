import { NgStyle, NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-rhombus',
  standalone: true,
  imports: [NgStyle,NgClass],
  templateUrl: './rhombus.component.html',
  styleUrl: './rhombus.component.scss',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class RhombusComponent {
  width=input(30)
  height=input(30)
  lock= input(false)
}
