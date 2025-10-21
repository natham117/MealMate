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

  constructor(
    private http: HttpClient, 
    private router: Router, 
    private authService: AuthService
  ) { }

  onSubmit() {
    console.log('📤 Login-Request wird gesendet...');
    
    this.http.post<{ 
      success: boolean, 
      userId?: number,
      email?: string,
      firstName?: string,
      lastName?: string
    }>('http://localhost:5000/api/login', {
      email: this.email,
      pw: this.pw
    }).subscribe({
      next: (result) => {
        console.log('📥 Login-Response:', result);
        
        if (result.success && result.userId && result.email) {
          console.log('✅ Login erfolgreich! User-ID:', result.userId);
          
          // Speichere User-Daten sowohl im Service als auch direkt im localStorage
          this.authService.setUserData(result.email, result.userId);
          
          // Zusätzliche Sicherheit: Direkt in localStorage schreiben
          localStorage.setItem('userId', result.userId.toString());
          localStorage.setItem('userEmail', result.email);
          
          console.log('💾 User-ID gespeichert:', localStorage.getItem('userId'));
          
          window.alert('Login erfolgreich!');
          
          // Kleine Verzögerung vor Navigation, damit localStorage garantiert geschrieben ist
          setTimeout(() => {
            this.router.navigate(['/recipes']);
          }, 100);
        } else {
          console.log('❌ Login fehlgeschlagen - Ungültige Antwort');
          window.alert('Login fehlgeschlagen!');
        }
      },
      error: (error) => {
        console.error('❌ Login-Fehler:', error);
        window.alert('Login fehlgeschlagen: ' + (error.message || 'Unbekannter Fehler'));
      }
    });
  }

  getEmail(){
    return this.email;
  }
}