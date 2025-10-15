import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from "@angular/router";
import { RegisterApiService } from './register-api.service';

function emailPolicyValidator(control: AbstractControl): ValidationErrors | null {
  const raw = String(control.value ?? '');
  if(!raw) return {required: true};

  const email = raw.trim();

  if(/\s/.test(email)) return { hasSpaceOrControl: true };
  for(const ch of email) {
    const c = ch.codePointAt(0)!;
    if (c <= 0x1F || c === 0x7F || (c >= 0x80 && c <= 0x9F)) return { hasSpaceOrControl: true};
  }

  if(email.length > 254) return {totalTooLong: true};

  const parts = email.split('@');
  if(parts.length !== 2) return {multipleAt: true};
  const [local, domain] = parts;
  if(!local || !domain) return {emptyPart: true};

  if(local.length > 64) return { localTooLong: true };

  if(!/^[A-Za-z0-9.!#$%&'*+/=?^_{|}~`-]+$/.test(local)) return { invalidLocalChars: true };
  if(local.startsWith('.') || local.endsWith('.')) return { localEdgeDot: true };
  if(local.includes('..')) return { localConsecutiveDots: true };

  const labels = domain.split('.')
  if(labels.some(l => l.length === 0)) return { emptyDomainLabel: true };

  for(const label of labels) {
    if(label.length > 63) return { domainLabelTooLong: true };
    if(!/^[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?$/.test(label)) return { domainLabelRule: true };
  }

  const tld = labels[labels.length -1];
  if (!/^[A-Za-z]{2,}$/.test(tld)) return { tldRule: true };
  return null;
}

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
  private fb = inject(FormBuilder);
  private api = inject(RegisterApiService);

  modalOpen = signal(false);
  modalTitle = signal('Bitte Eingaben prüfen');
  modalBody = signal<string | null>(null);

  showEmailRules = signal(false);
  showPasswordRules = signal(false);

  form = this.fb.group({
    fullName: [''],
    email: ['', [Validators.required, emailPolicyValidator]],
    username: [''],
    birthdate: [''],
    gender: [''],
    passwordGroup: this.fb.group({
      password: ['', [Validators.required, passwordPolicyValidator]],
      passwordConfirm: ['', [Validators.required]]
    }, { validators: [passwordMatchValidator]})
  });


  // E-Mail Fehler
  private emailErrors(): string[] {
    const e = this.form.get('email')?.errors ?? {};
    const msgs: string[] = [];
    if(e['required']) msgs.push('E-Mail ist erforderlich.');
    if(e['hasSpaceOrControl']) msgs.push('Keine Leer- oder Steuerzeichen in der E-Mail.');
    if(e['totalTooLong']) msgs.push('Adresse zu lang (max. 254 Zeichen).');
    if(e['multipleAt']) msgs.push('Genau ein "@" erforderlich.');
    if(e['emptyPart']) msgs.push('Vor und nach "@" muss Text stehen.');
    if(e['localTooLong']) msgs.push('Local-Part max. 64 Zeichen.');
    if(e['invalidLocalChars']) msgs.push('Local-Part enthält unzulässige Zeichen.');
    if(e['localEdgeDot']) msgs.push('Local-Part darf nicht mit Punkt beginnen/enden.');
    if(e['localConsecutiveDots']) msgs.push('Keine aufeinanderfolgenden Punkte im Local-Part.');
    if(e['emptyDomainLabel']) msgs.push('Leeres Domain-Label (z.B. doppelte Punkte) nicht erlaubt.');
    if(e['domainLabelTooLong']) msgs.push('Domain-Label max. 63 Zeichen.');
    if(e['domainLabelRule']) msgs.push('Domain-Labels müssen mit Buchstabe/Zahl beginnen und enden (Bindestrich nur in der Mitte).');
    if(e['tldRule']) msgs.push('TLD mindestens 2 Buchstaben (z. B. de, com).');
    return msgs;
  }


  // Passwort Fehler
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

      const emailErrs = this.emailErrors();
      const pwdErrs = this.passwordErrors();
      const totalErrs = emailErrs.length + pwdErrs.length + (this.matchError() ? 1 : 0);

      this.modalTitle.set('Bitte Eingaben prüfen');
      this.modalBody.set(null);
      this.showEmailRules.set(emailErrs.length > 0);
      this.showPasswordRules.set(pwdErrs.length > 0 || this.matchError());

      if(totalErrs === 1) {
        const msg =
          emailErrs[0] ??
          pwdErrs[0] ??
          (this.matchError() ? 'Passwörter stimmen nicht überein.' : 'Ungültige Eingabe.');
        this.modalTitle.set('Hinweis');
        this.modalBody.set(msg);
        this.showEmailRules.set(false);
        this.showPasswordRules.set(false);
      }

      this.modalOpen.set(true);
      return;
    }
    
    const v = this.form.value;
    const fullName = String (v.fullName ?? '').trim();
    const [firstName, ...rest] = fullName.split(' ');
    const lastName = rest.join(' ') || '';

    this.api.register({
      firstName,
      lastName,
      email: String(v.email ?? ''),
      password: String(v.passwordGroup?.password ?? '')
      }).subscribe({
      next: () => {
        this.modalTitle.set("Registrierung erfolgreich.");
        this.modalOpen.set(true);
        this.form.reset();
      },
        error: () => {
        this.modalTitle.set("Fehler");
        this.modalBody.set("Registrierung fehlgeschlagen.")
        this.modalOpen.set(true);
      }
    });
  }

  closeModal() {this.modalOpen.set(false);}
}
