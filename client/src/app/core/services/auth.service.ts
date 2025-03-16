import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface LoginResponse {
  token: string;
  user: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private apiUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) {
    this.initializeFromLocalStorage();
  }

  private initializeFromLocalStorage(): void {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        this.currentUserSubject.next({
          email: tokenPayload.email,
          role: tokenPayload.role,
          organizationId: tokenPayload.organizationId
        });
      } catch (error) {
        console.error('Error parsing token', error);
        this.logout();
      }
    }
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => {
          // Store token
          localStorage.setItem('token', response.token);
          
          // Parse user info from token
          try {
            const tokenPayload = JSON.parse(atob(response.token.split('.')[1]));
            this.currentUserSubject.next({
              email: tokenPayload.email,
              role: tokenPayload.role,
              organizationId: tokenPayload.organizationId
            });
          } catch (error) {
            console.error('Error parsing token', error);
          }
        })
      );
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  logout(): void {
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const expiry = tokenPayload.exp * 1000; // Convert to milliseconds
      return Date.now() < expiry;
    } catch (error) {
      return false;
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }
} 