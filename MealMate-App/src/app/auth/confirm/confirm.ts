import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-confirm',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './confirm.html',
  styleUrl: './confirm.css'
})
export class Confirm implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);
  private router = inject(Router);

  email = '';
  token = '';
  busy = signal(false);
  msg = signal<string>('Bitte bestätige deine E-Mail-Adresse.');
  ok = signal<boolean | null>(null);

  ngOnInit() {
    this.email = this.route.snapshot.queryParamMap.get('email') ?? '';
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';

    if(!this.email || !this.token) {
      this.ok.set(false);
      this.msg.set('Ungültiger oder unvollständiger Link.');
    }
  }

  async confirm() {
    if(!this.email || !this.token || this.busy()) return;
    this.busy.set(true);
    this.msg.set('Bestätige...');

    try {
      const url = 'http://localhost:5000/api/register/confirm';
      const res = await this.http.post<{ success: boolean; message?: string }>(
        url,
        { email: this.email, token: this.token },
        { observe: 'response' }
      ).toPromise();

      if(res?.body?.success) {
        this.ok.set(true);
        this.msg.set('E-Mail bestätigt! Dein Konto ist aktiv. Du kannst dich jetzt anmelden.');
      } else {
        this.ok.set(false);
        this.msg.set(res?.body?.message ?? 'Bestätigung fehlgeschlagen.');
      }
    } catch(err: any) {
      this.ok.set(false);
      this.msg.set(err?.error?.message ?? 'Bestätigung fehlgeschlagen (Server/Netzwerk).');
    } finally {
      this.busy.set(false);
    }
  }
}
