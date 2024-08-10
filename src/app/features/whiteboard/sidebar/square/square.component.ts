import { NgClass } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-square',
  standalone: true,
  imports: [NgClass],
  templateUrl: './square.component.html',
  styleUrl: './square.component.scss'
})
export class SquareComponent {
width=input(30);
height=input(30);
lock= input(false)
}
