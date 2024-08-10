import { NgClass, NgStyle } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-triangle',
  standalone: true,
  imports: [NgStyle,NgClass],
  templateUrl: './triangle.component.html',
  styleUrl: './triangle.component.scss'
})
export class TriangleComponent {
  width=input(30)
  height=input(30)
  lock= input(false)
}
