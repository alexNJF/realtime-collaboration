import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, Input, input, OnInit, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, tap } from 'rxjs';

@Component({
  selector: 'app-textbox',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './textbox.component.html',
  styleUrl: './textbox.component.scss',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export class TextboxComponent implements OnInit {
  private destroyRef = inject(DestroyRef);

  textChange=output<string>()
  colorChange=output<string>()
  width = input(30);
  height = input(30);
  lock = input(false);

  @Input() set bgColor(value: string|undefined) {
    if (value) {
      this.colorControl.setValue(value,{emitEvent:false})
    }
  }
  @Input() set text(value: string|undefined) {
    if (value) {
      this.textControl.setValue(value,{emitEvent:false})
    }
  }

  colorControl = new FormControl<string>('#d9d9d9')
  textControl = new FormControl<string>('')

  ngOnInit(): void {
   this.handleTextChange()
   this.handleColorChange()
  }
  handleColorChange() {
    this.colorControl.valueChanges
    .pipe(
      distinctUntilChanged(),
      tap((value) => {
        if(value){
          this.colorChange.emit(value)
        }
      }),
      takeUntilDestroyed(this.destroyRef),
    )
    .subscribe();
  }
  handleTextChange() {
    this.textControl.valueChanges
    .pipe(
      distinctUntilChanged(),
      tap((value) => {
        if(value){
          this.textChange.emit(value)
        }
      }),
      takeUntilDestroyed(this.destroyRef),
    )
    .subscribe();
  }

}
