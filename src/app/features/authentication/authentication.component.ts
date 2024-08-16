import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.scss',
  changeDetection:ChangeDetectionStrategy.OnPush
})
export default class AuthenticationComponent {
  readonly #fb = inject(FormBuilder);
  readonly #router = inject(Router);
  readonly form = this.#fb.group({
    username: [null, Validators.required]
  })

  submit(){
    if(this.form.valid){
      this.#router.navigate(['whiteboard',this.form.value.username])
    }
  }
}
