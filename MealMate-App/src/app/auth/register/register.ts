import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from "@angular/router";

function passwordPolicyValidator(control: AbstractControl): ValidationErrors | null {
  const v = String(control.value ?? '');

  if (!v) return { required: true };

  const errors: Record<string, true> = {};
  // if (v.length < 8) errors.tooShort = true;
  // if (!/[A-Z]/.test(v)) errors.noUpper = true;
  // if (!/\d/.test(v)) errors.noDigit = true;

  if (v.length < 8) errors['tooShort'] = true;
  if (!/[A-Z]/.test(v)) errors['noUpper'] = true;
  if (!/\d/.test(v)) errors['noDigit'] = true;

  const hasSpace = /\s/.test(v);
  let hasControl = false;

  for (const ch of v) {
    const c = ch.codePointAt(0)!;
    if(c <= 0x1F || c === 0x7F || (c >= 0x80 && c <= 0x9F)) { hasControl = true; break; }
  }
  // if (hasSpace || hasControl) errors.hasSpaceOrControl = true;
  if (hasSpace || hasControl) errors['hasSpaceOrControl'] = true;

  return Object.keys(errors).length ? errors : null;
}

function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const pwd = group.get('password')?.value ?? '';
  const rep = group.get('passwordConfirm')?.value ?? '';
  return pwd && rep && pwd !== rep ? { passwordsNotMatch: true } : null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  //submitting = signal(false);

  //constructor(private fb: FormBuilder) {}

  private fb = inject(FormBuilder);

  form = this.fb.group({
    fullName: [''],
    email: [''],
    username: [''],
    birthdate: [''],
    gender: [''],
    passwordGroup: this.fb.group({
      password: ['', [Validators.required, passwordPolicyValidator]],
      passwordConfirm: ['', [Validators.required]]
    }, { validators: [passwordMatchValidator]})
  });

  submit() {
    if(this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    alert('Formular valide (Demo).')
  }
}
