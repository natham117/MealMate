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
    console.log('📤 [Login] Request wird gesendet...');
    
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
        console.log('📥 [Login] Response:', result);
        
        if (result.success && result.userId && result.email) {
          console.log('✅ [Login] Login erfolgreich! User-ID:', result.userId);
          
          // Speichere User-Daten
          this.authService.setUserData(result.email, result.userId);
          
          // Direkt in localStorage schreiben (double-check)
          localStorage.setItem('userId', result.userId.toString());
          localStorage.setItem('userEmail', result.email);
          
          console.log('💾 [Login] localStorage nach Speicherung:');
          console.log('   - userId:', localStorage.getItem('userId'));
          console.log('   - userEmail:', localStorage.getItem('userEmail'));
          
          window.alert('Login erfolgreich!');
          
          this.router.navigate(['/recipes']);
        } else {
          console.log('❌ [Login] Login fehlgeschlagen - Ungültige Antwort');
          window.alert('Login fehlgeschlagen!');
        }
      },
      error: (error) => {
        console.error('❌ [Login] Fehler:', error);
        window.alert('Login fehlgeschlagen: ' + (error.message || 'Unbekannter Fehler'));
      }
    });
  }

  getEmail(){
    return this.email;
  }
}