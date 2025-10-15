import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  email: string = '';
  pwHash: string = '';

  constructor(private http: HttpClient) { }

  onSubmit() {
    this.http.post('http://localhost:5000/api/login', {
      email: this.email,
      pwHash: this.pwHash
    }).subscribe(result => {
      if (result == true) {
        window.alert('Login erfolgreich!');
      }
      else {
        window.alert('Login fehlgeschlagen!');
      }
    }
    )
  };
}
