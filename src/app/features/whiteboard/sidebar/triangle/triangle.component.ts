import { NgStyle } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-triangle',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './triangle.component.html',
  styleUrl: './triangle.component.scss'
})
export class TriangleComponent {
  width=input(30)
  height=input(30)
}
