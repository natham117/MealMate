import { Injectable } from '@angular/core';

@Injectable({providedIn: 'root'})
export class AuthService {
    private email: string = '';
    private userId: number | null = null;

    setEmail(email: string) {
        this.email = email;
    }

    getEmail(): string {
        return this.email;
    }

    setUserId(userId: number) {
        this.userId = userId;
        localStorage.setItem('userId', userId.toString());
    }

    getUserId(): number | null {
        if (this.userId === null) {
            const stored = localStorage.getItem('userId');
            this.userId = stored ? parseInt(stored) : null;
        }
        return this.userId;
    }

    setUserData(email: string, userId: number) {
        this.setEmail(email);
        this.setUserId(userId);
    }

    logout() {
        this.email = '';
        this.userId = null;
        localStorage.removeItem('userId');
    }

    isLoggedIn(): boolean {
        return this.userId !== null;
    }
}