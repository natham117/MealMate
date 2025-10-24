import { Component } from '@angular/core';
import { Router, RouterLink } from "@angular/router";
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AuthService } from './auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email: string = '';
  pw: string = '';
  busy = false;  // Verhindert Doppel-Submits

  // Snackbar
  snackbarMessage = '';
  snackbarType: 'ok' | 'fail' = 'ok';
  showSnackbar = false;

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) { }

  onSubmit() {
    // busy-Check
    if (this.busy) return;

    // Input-Validierung
    const email = (this.email ?? '').trim();
    const password = this.pw ?? '';

    if (!email || !password) {
      this.showSnackbarMessage("Bitte E-Mail und Passwort eingeben", "fail");
      return;
    }

    this.busy = true;
    console.log('📤 [Login] Request wird gesendet...');

    this.http.post<{
      success: boolean,
      userId?: number,
      email?: string,
      firstName?: string,
      lastName?: string,
      message?: string
    }>('http://localhost:5000/api/login', {
      email: email,
      pw: password,
      password: password
    }, {
      observe: 'response'
    }).subscribe({
      next: (res) => {
        console.log('📥 [Login] Response:', res);
        const result = res.body;

        // Speichere User-Daten (WICHTIG für Interceptor!)
        if (result?.success && result.userId && result.email) {
          // Speichere User-Daten im AuthService
          this.authService.setUserData(result.email, result.userId);

          // Direkt in localStorage schreiben (double-check für Interceptor)
          localStorage.setItem('userId', result.userId.toString());
          localStorage.setItem('userEmail', result.email);

          this.router.navigate(['/recipes']);
        } else {
          this.showSnackbarMessage((result?.message || "Login fehlgeschlagen.", "fail"));
        }
      },
      error: (err) => {
        this.busy = false;
        console.error('❌ [Login] Fehler:', err);

        // Spezifisches Error-Handling
        if (err?.status === 403) {
          this.showSnackbarMessage(err?.error?.message ?? 'Bitte bestätigen Sie Ihre E-Mail-Adresse, um sich einloggen zu können.', "fail");
          
        } else if (err?.status === 401) {
          this.showSnackbarMessage(err?.error?.message ?? 'E-Mail oder Passwort ist falsch.', "fail");
        } else {
          this.showSnackbarMessage(err?.error?.message ?? `Server-/Netzwerkfehler (${err?.status ?? 'unbekannt'}).`, "fail");
        }
      },
      complete: () => {
        this.busy = false;
      }
    });
  }

  getEmail() {
    return this.email;
  }

  // Snackbar
  showSnackbarMessage(msg: string, type: 'ok' | 'fail' = 'ok'): void {
    this.snackbarMessage = msg;
    this.snackbarType = type;
    this.showSnackbar = true;
    setTimeout(() => (this.showSnackbar = false), 5000);
  }
}