import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService, User } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.scss']
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  displayedColumns: string[] = ['name', 'email', 'role', 'status', 'actions'];
  isLoading = true;
  error: string | null = null;
  isAdmin = false;
  currentUserId: number | null = null;

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    const currentUser = this.authService.getCurrentUser();
    this.currentUserId = currentUser?.id || null;
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.error = null;
    
    this.userService.getUsers().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load users';
        this.isLoading = false;
        if (this.error) {
          this.snackBar.open(this.error, 'Close', { duration: 5000 });
        }
      }
    });
  }

  createUser(): void {
    this.router.navigate(['/users/new']);
  }

  editUser(userId: number): void {
    this.router.navigate([`/users/${userId}/edit`]);
  }

  viewProfile(userId: number): void {
    this.router.navigate([`/users/${userId}`]);
  }

  deleteUser(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete User',
        message: `Are you sure you want to delete ${user.name}?`,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.deleteUser(user.id).subscribe({
          next: () => {
            this.snackBar.open('User deleted successfully', 'Close', { duration: 3000 });
            this.loadUsers();
          },
          error: (err) => {
            const errorMsg = err.error?.message || 'Failed to delete user';
            this.snackBar.open(errorMsg, 'Close', { duration: 5000 });
          }
        });
      }
    });
  }

  getRoleClass(role: string): string {
    switch (role) {
      case 'admin':
        return 'role-admin';
      case 'manager':
        return 'role-manager';
      case 'auditor':
        return 'role-auditor';
      default:
        return 'role-user';
    }
  }

  getStatusClass(isActive: boolean): string {
    return isActive ? 'status-active' : 'status-inactive';
  }
} 