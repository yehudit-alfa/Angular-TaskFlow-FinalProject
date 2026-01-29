import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthResponse, LoginCredentials, User } from '../models/user';
import { Observable } from 'rxjs';

// export interface UserInfo {
//   id: string;
//   name: string;
//   email: string;
// }

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/auth';
  private usersApiUrl = 'http://localhost:3000/api/users';

  register(userData: User) {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }
  login(credentials: LoginCredentials) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials);
  }
  setToken(token: string) {
    localStorage.setItem('auth_token', token);
  }
  getToken() {
    return localStorage.getItem('auth_token');
  }
  setUser(user: User) {
    try { localStorage.setItem('auth_user', JSON.stringify(user)); } catch {}
  }
  getUser(): User | null {
    try { const v = localStorage.getItem('auth_user'); return v ? JSON.parse(v) as User : null; } catch { return null; }
  }
  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }

  // NEW: Get current user info from server
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }
}
