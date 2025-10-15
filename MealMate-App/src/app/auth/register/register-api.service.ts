import { inject, Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';

export interface RegisterDto {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

@Injectable({ providedIn: 'root' })
export class RegisterApiService {
    private http = inject(HttpClient);
    private base = 'https://localhost:5001/api/users';

    register(dto: RegisterDto) {
        return this.http.post<{userId: number }>(`${this.base}/register`, dto);
    }
}