import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthResponse {
  user: User;
  tokens: {
    access: string;
    refresh: string;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  
  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }
  
  private loadUserFromStorage(): void {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        this.currentUserSubject.next(JSON.parse(user));
      } catch (error) {
        console.error('Error parsing user from localStorage', error);
        this.logout();
      }
    }
  }
  
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          localStorage.setItem('access_token', response.tokens.access);
          localStorage.setItem('refresh_token', response.tokens.refresh);
          localStorage.setItem('user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }),
        catchError(error => {
          return throwError(() => new Error(error.error?.message || 'Login failed'));
        })
      );
  }
  
  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, { name, email, password })
      .pipe(
        catchError(error => {
          return throwError(() => new Error(error.error?.message || 'Registration failed'));
        })
      );
  }
  
  refreshToken(): Observable<{access: string}> {
    const refreshToken = localStorage.getItem('refresh_token');
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }
    
    return this.http.post<{access: string}>(`${this.apiUrl}/auth/refresh-token`, { refreshToken })
      .pipe(
        tap(response => {
          localStorage.setItem('access_token', response.access);
        }),
        catchError(error => {
          this.logout();
          return throwError(() => new Error('Session expired. Please login again.'));
        })
      );
  }
  
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }
  
  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }
  
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }
  
  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }
} 