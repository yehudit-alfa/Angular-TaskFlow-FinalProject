import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthResponse, LoginCredentials, User } from '../models/user';
import { Observable, BehaviorSubject, tap } from 'rxjs';
import { API_BASE_URL } from '../app.config.constants';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private http = inject(HttpClient);

  private apiUrl = `${API_BASE_URL}/api/auth`;
  private usersApiUrl = `${API_BASE_URL}/api/users`;

  private userSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.userSubject.asObservable();

  register(userData: User) {
    return this.http.post(`${this.apiUrl}/register`, userData).pipe(
      tap(() => this.refreshUser())
    );
  }

  login(credentials: LoginCredentials) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(() => this.refreshUser())
    );
  }

  setToken(token: string) {
    localStorage.setItem('auth_token', token);
  }

  getToken() {
    return localStorage.getItem('auth_token');
  }

  logout() {
    localStorage.removeItem('auth_token');
    this.userSubject.next(null);
  }

  // NEW: Get current user info from server
  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`);
  }

  refreshUser() {
    this.getCurrentUser().subscribe({
      next: (user) => this.userSubject.next(user),
      error: () => this.userSubject.next(null)
    });
  }
}
