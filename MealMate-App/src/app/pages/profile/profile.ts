import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/login/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {
  today: string = new Date().toISOString().split('T')[0];
  user: any = {};
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
    console.log('Lade Profil für:', this.email);
    this.http.post(
      'http://localhost:5000/api/profile',
      JSON.stringify(this.email),
      { headers: { 'Content-Type': 'application/json' } }
    ).subscribe(result => {
      this.user = result;
      if (this.user.birthDate) {
        this.user.birthDate = this.user.birthDate.split('T')[0];
      }
      if (this.user) {
        console.log('API result:', this.user.firstName);
      }
      else {
        console.log('API result: Kein Benutzer gefunden');
      }
    });
  };

  onSubmit() {
    this.successMessage = "";
    this.errorMessage = "";

    if (this.user.birthDate === '') {
      this.user.birthDate = null;
    }

    this.http.post<{ success: boolean, rows: number, errorMessage: string }>(
      "http://localhost:5000/api/profile/update", {
      user: this.user,
      oldEmail: this.email,
      newPassword: this.newPassword
    }).subscribe(result => {
      if(result.success){
        console.log("Es wurden", result.rows, "erfolgreich verändert:", result.success)
          this.errorMessage = "";
          this.successMessage = "Aktualisierung des Profils erfolgreich!";
          if (this.user.email === this.authService.getEmail()) {
            this.authService.setEmail(this.user.email);
          }
        } else if (result.errorMessage?.includes("Bestätigungsmail wurde an die neue Adresse gesendet")) {
          this.successMessage = "Eine Bestätigungsmail wurde an deine neue E-Mail-Adresse gesendet. Bitte überprüfe dein Postfach.";
          this.errorMessage = "";
        } else {
          this.successMessage = "";
          this.errorMessage = result.errorMessage;
        }
    });
  }

  openImageModal(){
    this.showImageModal = true;
  }

  closeImageModal(){
    this.showImageModal = false;
    this.newImageUrl = '';
  }

  updateImageUrl(){
    if (this.newImageUrl.trim() !== ''){
      this.user.imageUrl = this.newImageUrl.trim();
    }
    this.onSubmit();
    this.closeImageModal();
  }

  deleteImage() {
    this.user.imageUrl = null;
    this.onSubmit();
    this.closeImageModal();
  }
}
