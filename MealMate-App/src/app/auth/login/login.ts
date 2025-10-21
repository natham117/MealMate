import { Component } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email: string = '';
  pw: string = '';
  busy = false;

  constructor(
    private http: HttpClient, 
    private router: Router, 
    private authService: AuthService
  ) {}

  onSubmit() {
    if(this.busy) return;
    const email = (this.email ?? '').trim();
    const password = this.pw ?? '';

    if(!email || !password) {
      window.alert('Bitte E-Mail und Passwort eingeben.');
      return;
    }

    this.busy = true;

    this.http.post<{ success: boolean; message?: string }>(
      'http://localhost:5000/api/login',
      { email, password },
      { observe: 'response' }
    ).subscribe({
      next: (res) => {
        console.log('[Login] response:', res);
        const body = res.body;

        if(body?.success) {
          window.alert('Login erfolgreich!');
          this.router.navigate(['/app-home']);
        } else {
          window.alert(body?.message ?? 'Login fehlgeschlagen.')
        }
      },
      error: (err) => {
        console.log('[Login] error:', err);

        if(err?.status === 403) {
          window.alert(err?.error?.message ?? 'Bitte bestätigen Sie Ihre E-Mail-Adresse, um sich einloggen zu können.');
        } else if(err?.status === 401) {
          window.alert('E-Mail oder Passwort ist falsch.');
        } else {
          window.alert(err?.error?.message ?? `Server-/Netzwerkfehler (${err?.status ?? 'unbekannt'}).`);
        }
      },
      complete: () => this.busy = false
    })
    
  };

  getEmail(){
    return this.email;
  }
}
