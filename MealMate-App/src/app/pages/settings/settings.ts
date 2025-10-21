import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/login/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class Settings {
  user: any = null;
  email: string = '';
  newPassword: string = '';
  newImageUrl: string = '';
  showImageModal: boolean = false;
  fallbackUrl = 'https://static.vecteezy.com/ti/gratis-vektor/t1/2534006-social-media-chatting-online-leeres-profil-bild-kopf-und-korper-symbol-menschen-stehend-symbol-grauer-hintergrund-kostenlos-vektor.jpg';
  errorMessage: string = '';
  successMessage: string = '';

  constructor(private http: HttpClient, private authService: AuthService) { }

  ngOnInit() {
    this.onLoad();
  }

  onLoad() {
    this.email = this.authService.getEmail();
    this.http.post(
      'http://localhost:5000/api/profile',
      JSON.stringify(this.email),
      { headers: { 'Content-Type': 'application/json' } }
    ).subscribe(result => {
      this.user = result;
      if (this.user) {
        console.log('Lade Profil für:', this.user.email);
      }
      else {
        console.log('API result: Kein Benutzer gefunden');
      }
    });
  };

  onSubmit() {
    this.successMessage = "";
    this.errorMessage = "";

    this.http.post<{ success: boolean, rows: number, errorMessage: string }>(
      "http://localhost:5000/api/profile/update", {
      user: this.user,
      oldEmail: this.authService.getEmail(),
      newPassword: this.newPassword
    }).subscribe(result => {
      setTimeout(() => {
        if (result.success) {
          this.errorMessage = "";
          this.successMessage = "Aktualisierung des Profils erfolgreich!";
          this.authService.setEmail(this.user.email);
        } else {
          this.successMessage = "";
          this.errorMessage = result.errorMessage;
        }
      }, 50);
    });
  }

  openImageModal() {
    this.showImageModal = true;
  }

  closeImageModal() {
    this.showImageModal = false;
    this.newImageUrl = '';
  }

  updateImageUrl() {
    if (this.newImageUrl.trim() !== '') {
      this.user.imageUrl = this.newImageUrl.trim();
    }
    this.onSubmit();
    this.closeImageModal();
  }
}
