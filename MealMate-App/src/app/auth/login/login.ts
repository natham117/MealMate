import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

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

  constructor(private http: HttpClient, private router: Router) { }

  onSubmit() {
    this.http.post<{ success: boolean}>('http://localhost:5000/api/login', {
      email: this.email,
      pw: this.pw
    }).subscribe(result => {
      console.log('API result:', result);
      if (result.success) {
        window.alert('Login erfolgreich!');
        this.router.navigate(['/app-home']);
      }
      else {
        window.alert('Login fehlgeschlagen!');
      }
    }
    )
  };
}
