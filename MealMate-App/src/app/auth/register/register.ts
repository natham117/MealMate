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
  if (!/[a-z]/.test(v)) errors['noLower'] = true;

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

  modalOpen = signal(false);
  modalTitle = signal('Ungültiges Passwort');
  modalBody = signal<string | null>(null);

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

  // Hilfsfunktionen
  private passwordErrors(): string[] {
    const errs = this.form.get('passwordGroup.password')?.errors ?? {};
    const msgs: string[] = [];
    if (errs['required']) msgs.push('Passwort ist erforderlich.');
    if (errs['tooShort']) msgs.push('Mindestens 8 Zeichen.');
    if (errs['noDigit']) msgs.push('Mindestens eine Zahl.');
    if (errs['noUpper']) msgs.push('Mindestens ein Großbuchstabe.');
    if (errs['noLower']) msgs.push('Mindestens ein Kleinbuchstabe.');
    if (errs['hasSpaceOrControl']) msgs.push('Keine Leer- oder Steuerzeichen erlaubt.');
    return msgs;
  }
  private matchError(): boolean {
    return !!this.form.get('passwordGroup')?.errors?.['passwordsNotMatch'];
  }

  // Klick auf "Konto erstellen"
  submit() {
    if(this.form.invalid) {
      this.form.markAllAsTouched();

      const pwdErrs = this.passwordErrors();
      const totalErrs = pwdErrs.length + (this.matchError() ? 1 : 0);

      if(totalErrs > 1) {
        this.modalTitle.set('Bitte Passwort-Richtlinien beachten');
        this.modalBody.set(null);
      } else if(totalErrs === 1) {
        this.modalTitle.set('Hinweis');
        this.modalBody.set(this.matchError() ? 'Passwörter stimmen nicht überein.' : pwdErrs[0]);
      } else {
        this.modalTitle.set('Bitte Eingaben prüfen');
        this.modalBody.set('Es fehlen noch Angaben oder Felder sind ungültig.')
      }
      this.modalOpen.set(true);
      return;
    }
    alert('Formular valide (Demo).')
  }

  closeModal() {this.modalOpen.set(false);}
}
