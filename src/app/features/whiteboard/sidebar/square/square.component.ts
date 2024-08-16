import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-square',
  standalone: true,
  imports: [NgClass],
  templateUrl: './square.component.html',
  styleUrl: './square.component.scss',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class SquareComponent {
width=input(30);
height=input(30);
lock= input(false)
}
