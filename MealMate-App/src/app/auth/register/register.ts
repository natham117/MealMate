import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from "@angular/router";
import { firstValueFrom } from 'rxjs';


const API_BASE = 'http://localhost:5000/api';


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
  private http = inject(HttpClient);
  private router = inject(Router);

  modalOpen = signal(false);
  modalTitle = signal('Bitte Eingaben prüfen');
  modalBody = signal<string | null>(null);

  showEmailRules = signal(false);
  showPasswordRules = signal(false);
  busy = signal(false); 

  form = this.fb.group({
    firstName: [''],
    lastName: [''],
    email: ['', [Validators.required, emailPolicyValidator]],
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
  async submit() {
    if (this.form.invalid) {
    this.form.markAllAsTouched();
    this.modalTitle.set('Bitte Eingaben prüfen');
    this.modalBody.set('Das Formular enthält ungültige Eingaben.');
    this.modalOpen.set(true);
    return;
  }

  this.busy.set(true);
  try {
    const email = (this.form.get('email')?.value ?? '').trim();
    const pwd   = this.form.get('passwordGroup.password')?.value ?? '';
    const firstName = this.form.get('firstName')?.value ?? '';
    const lastName = this.form.get('lastName')?.value ?? '';

    const payload = { firstName, lastName, email, password: pwd };
    console.log('[Register] Payload to backend:', payload);

    const url = 'http://localhost:5000/api/register'; 
    const res = await firstValueFrom(
      this.http.post<{ success: boolean; userId?: number; message?: string }>(url, payload)
    );

    console.log('[Register] Response:', res);
    if (res.success) {
      // this.modalTitle.set('Registrierung erfolgreich');
      // this.modalBody.set(`Konto erstellt (UserId: ${res.userId}).`);
      // this.showEmailRules.set(false);
      // this.showPasswordRules.set(false);
      // this.modalOpen.set(true);
        window.alert('Registrierung erfolgreich!');
        this.router.navigate(['/login']);
    } else {
      // this.modalTitle.set('Registrierung fehlgeschlagen');
      // this.modalBody.set(res.message ?? 'Unbekannter Fehler.');
      // this.modalOpen.set(true);
      window.alert('Registrierung fehlgeschlagen: ' + (res.message ?? 'Unbekannter Fehler.'));
    }
  } catch (err: any) {
    console.log('[Register] HTTP error raw:', err);
    console.log('[Register] Server body:', err?.error);
    const msg = err?.error?.message
      ?? (err?.status === 409 ? 'E-Mail ist bereits registriert.'
      : err?.status ? `Server-Fehler (${err.status}).` : 'Netzwerk/CORS-Fehler (siehe Network).');
    this.modalTitle.set('Registrierung fehlgeschlagen');
    this.modalBody.set(msg);
    this.modalOpen.set(true);
  } finally {
    this.busy.set(false);
  }
  }

  closeModal() {this.modalOpen.set(false);}
}
