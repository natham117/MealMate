import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth/login/auth.service';

@Component({
  selector: 'app-settings',
  imports: [CommonModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css'
})
export class Settings {
  user: any = null;
  email: string = '';

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
      if (this.user){
        console.log('API result:', this.user.firstName);
      }
      else {
        console.log('API result: Kein Benutzer gefunden');
      }
    });
  };
}
