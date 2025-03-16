import { Injectable } from '@angular/core';
import { Router, CanActivate, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    const token = localStorage.getItem('token');
    
    if (token) {
      // Check if the token is expired
      try {
        const tokenPayload = JSON.parse(atob(token.split('.')[1]));
        const expiry = tokenPayload.exp * 1000; // Convert to milliseconds
        
        if (Date.now() < expiry) {
          return true;
        }
      } catch (error) {
        // Token is invalid format
        console.error('Invalid token format', error);
      }
    }
    
    // Not logged in or token expired, redirect to login
    this.router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }
} 