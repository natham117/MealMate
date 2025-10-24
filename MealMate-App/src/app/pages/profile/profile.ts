import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/login/auth.service';
import { FormsModule } from '@angular/forms';
import { Data } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class Profile {
  today: string = new Date().toISOString().split('T')[0];
  user: any = {};
  originalUser: any = {};
  email: string = '';
  newImageUrl: string = '';
  showImageModal: boolean = false;
  fallbackUrl = 'https://static.vecteezy.com/ti/gratis-vektor/t1/2534006-social-media-chatting-online-leeres-profil-bild-kopf-und-korper-symbol-menschen-stehend-symbol-grauer-hintergrund-kostenlos-vektor.jpg';

  // Password-Modal
  showPasswordModal: boolean = false;
  oldPassword = '';
  newPassword: string = '';
  confirmPassword: string = '';

  // Snackbar
  snackbarMessage = '';
  snackbarType: 'ok' | 'fail' = 'ok';
  showSnackbar = false;

  constructor(private http: HttpClient, private authService: AuthService) { }

  ngOnInit() {
    this.onLoad();
  }

  onLoad() {
    this.email = this.authService.getEmail();
    console.log('Lade Profil für:', this.email);
    this.http.post<{ success: boolean, message: string, user: Data }>(
      'http://localhost:5000/api/profile/load',
      JSON.stringify(this.email),
      { headers: { 'Content-Type': 'application/json' } }
    ).subscribe(result => {
      if (result.success) {
        this.user = result.user;
        if (this.user.birthDate) {
          this.user.birthDate = this.user.birthDate.split('T')[0];
        }
        this.originalUser = JSON.parse(JSON.stringify(this.user));
      }
      console.log(result.message);
    });
  };

  updateUser() {
    if (this.user.birthDate === '') {
      this.user.birthDate = null;
    }

    this.http.post<{ success: boolean, rows: number, message: string }>(
      "http://localhost:5000/api/profile/update", {
      user: this.user,
      oldEmail: this.email,
      newPassword: this.newPassword
    }).subscribe({
      next: (res) => {
      if (res.success) {
        this.showSnackbarMessage(res.message, "ok")
        this.originalUser = JSON.parse(JSON.stringify(this.user));
        if (this.user.email === this.authService.getEmail()) {
          this.authService.setEmail(this.user.email);
        }
      }
    },
    error: (err) => {
      this.showSnackbarMessage(err.error.message, "fail");
    }
    });
  }

  // Funktionen des Image-Modals
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
    this.updateUser();
    this.closeImageModal();
  }

  deleteImage() {
    this.user.imageUrl = null;
    this.updateUser();
    this.closeImageModal();
  }

  // Funktionen des Password-Modals
  openPasswordModal() {
    this.showPasswordModal = true;
  }

  closePasswordModal() {
    this.showPasswordModal = false;
  }

  updatePassword() {
    if (!this.oldPassword || !this.newPassword || !this.confirmPassword) {
      this.showSnackbarMessage("Bitte alle Felder ausfüllen.", "fail");
      return;
    }

    if (this.oldPassword == this.newPassword) {
      this.showSnackbarMessage("Das neue Passwort darf nicht dem alten Password entsprechen.", "fail");
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.showSnackbarMessage("Die neuen Passwörter stimmen nicht überein.", "fail");
      return;
    }

    this.http.post<{ success: boolean, rows: number, message: string }>('http://localhost:5000/api/profile/change-password', {
      oldPassword: this.oldPassword,
      newPassword: this.newPassword,
      email: this.user.email
    }).subscribe({
      next: (result: any) => {
        if (result.success) {
          this.showSnackbarMessage(result.message, "ok")
          this.oldPassword = this.newPassword = this.confirmPassword = '';
          this.closePasswordModal();
        }
      },
      error: (err: any) => {
        this.showSnackbarMessage(err.error.message, "fail");
      },
    })
  }

  hasChanges(): boolean{
      return JSON.stringify(this.user) !== JSON.stringify(this.originalUser);
  }

  // Snackbar
  showSnackbarMessage(msg: string, type: 'ok' | 'fail' = 'ok'): void {
    this.snackbarMessage = msg;
    this.snackbarType = type;
    this.showSnackbar = true;
    setTimeout(() => (this.showSnackbar = false), 5000);
  }
}
