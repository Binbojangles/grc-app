import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

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
    { label: 'Assessments', icon: 'assessment', route: '/assessments' },
    { label: 'Users', icon: 'people', route: '/users', adminOnly: true }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Get user info from AuthService
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userName = currentUser.name || currentUser.email || 'User';
      this.userRole = currentUser.role || 'User';
      
      // Filter nav items based on user role
      if (currentUser.role !== 'admin') {
        this.navItems = this.navItems.filter(item => !item.adminOnly);
      }
    }
    
    // Subscribe to user changes
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userName = user.name || user.email || 'User';
        this.userRole = user.role || 'User';
      }
    });
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
} 