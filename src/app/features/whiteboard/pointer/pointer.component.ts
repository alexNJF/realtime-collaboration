import { NgStyle } from '@angular/common';
import { Component, input } from '@angular/core';

@Component({
  selector: 'app-pointer',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './pointer.component.html',
  styleUrl: './pointer.component.scss'
})
export class PointerComponent {
pointer=input<any>()
}
