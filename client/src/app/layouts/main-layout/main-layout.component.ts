import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss']
})
export class MainLayoutComponent implements OnInit {
  isMenuOpen = true;
  userName = '';
  userRole = '';

  navItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/' },
    { label: 'Domains', icon: 'domain', route: '/domains' },
    { label: 'Controls', icon: 'security', route: '/controls' },
    { label: 'Assets', icon: 'devices', route: '/assets' },
    { label: 'Policies', icon: 'policy', route: '/policies' },
    { label: 'Assessments', icon: 'assessment', route: '/assessments' }
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Get user info from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        this.userName = tokenData.email || 'User';
        this.userRole = tokenData.role || 'User';
      } catch (error) {
        console.error('Error parsing token', error);
      }
    }
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
} 