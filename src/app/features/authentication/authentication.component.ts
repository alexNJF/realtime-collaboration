import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-authentication',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './authentication.component.html',
  styleUrl: './authentication.component.scss'
})
export default class AuthenticationComponent {
  readonly #fb = inject(FormBuilder);
  readonly #router = inject(Router);
  readonly form = this.#fb.group({
    username: [null, Validators.required]
  })

  submit(){
    if(this.form.valid){
      //save curent username on services 
      this.#router.navigate(['designer',this.form.value.username])
    }
  }
}
