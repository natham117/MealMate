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
  busy = false;  // Verhindert Doppel-Submits

  constructor(
    private http: HttpClient, 
    private router: Router, 
    private authService: AuthService
  ) {}

  onSubmit() {
    // busy-Check
    if (this.busy) return;
    
    // Input-Validierung
    const email = (this.email ?? '').trim();
    const password = this.pw ?? '';

    if (!email || !password) {
      window.alert('Bitte E-Mail und Passwort eingeben.');
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
          console.log('✅ [Login] Login erfolgreich! User-ID:', result.userId);
          
          // Speichere User-Daten im AuthService
          this.authService.setUserData(result.email, result.userId);
          
          // Direkt in localStorage schreiben (double-check für Interceptor)
          localStorage.setItem('userId', result.userId.toString());
          localStorage.setItem('userEmail', result.email);
          
          console.log('💾 [Login] localStorage nach Speicherung:');
          console.log('   - userId:', localStorage.getItem('userId'));
          console.log('   - userEmail:', localStorage.getItem('userEmail'));
          
          window.alert('Login erfolgreich!');
          
          this.router.navigate(['/recipes']);
        } else {
          console.log('❌ [Login] Login fehlgeschlagen');
          const message = result?.message || 'Login fehlgeschlagen.';
          window.alert(message);
        }
      },
      error: (err) => {
        console.error('❌ [Login] Fehler:', err);
        
        // Spezifisches Error-Handling
        if (err?.status === 403) {
          window.alert(err?.error?.message ?? 'Bitte bestätigen Sie Ihre E-Mail-Adresse, um sich einloggen zu können.');
        } else if (err?.status === 401) {
          window.alert(err?.error?.message ?? 'E-Mail oder Passwort ist falsch.');
        } else {
          window.alert(err?.error?.message ?? `Server-/Netzwerkfehler (${err?.status ?? 'unbekannt'}).`);
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
}