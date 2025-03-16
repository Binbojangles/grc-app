import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin, of, switchMap } from 'rxjs';
import { OrganizationService, Organization } from '../../services/organization.service';
import { UserService, User } from '../../services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { OrganizationEditDialogComponent } from '../organization-edit-dialog/organization-edit-dialog.component';
import { UserAddDialogComponent } from '../user-add-dialog/user-add-dialog.component';

@Component({
  selector: 'app-organization-detail',
  templateUrl: './organization-detail.component.html',
  styleUrls: ['./organization-detail.component.scss']
})
export class OrganizationDetailComponent implements OnInit {
  organization: Organization | null = null;
  users: any[] = [];
  isLoading = true;
  error: string | null = null;
  isAdmin = false;
  userDisplayedColumns: string[] = ['name', 'email', 'role', 'status', 'actions'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private organizationService: OrganizationService,
    private userService: UserService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadOrganizationData();
  }

  loadOrganizationData(): void {
    this.isLoading = true;
    this.error = null;
    const orgId = +this.route.snapshot.paramMap.get('id')!;

    // Load both organization details and its users
    this.organizationService.getOrganizationById(orgId).pipe(
      switchMap(org => {
        this.organization = org;
        return this.organizationService.getOrganizationUsers(orgId);
      })
    ).subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load organization details';
        this.isLoading = false;
        if (this.error) {
          this.snackBar.open(this.error, 'Close', { duration: 5000 });
        }
      }
    });
  }

  editOrganization(): void {
    if (!this.organization) return;

    const dialogRef = this.dialog.open(OrganizationEditDialogComponent, {
      width: '600px',
      data: { organization: this.organization }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.organizationService.updateOrganization(this.organization!.id, result).subscribe({
          next: (updatedOrg) => {
            this.organization = updatedOrg;
            this.snackBar.open('Organization updated successfully', 'Close', { duration: 3000 });
          },
          error: (err) => {
            const errorMsg = err.error?.message || 'Failed to update organization';
            this.snackBar.open(errorMsg, 'Close', { duration: 5000 });
          }
        });
      }
    });
  }

  deleteOrganization(): void {
    if (!this.organization) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Organization',
        message: `Are you sure you want to delete ${this.organization.name}? This cannot be undone.`,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.organization) {
        this.organizationService.deleteOrganization(this.organization.id).subscribe({
          next: () => {
            this.snackBar.open('Organization deleted successfully', 'Close', { duration: 3000 });
            this.router.navigate(['/organizations']);
          },
          error: (err) => {
            const errorMsg = err.error?.message || 'Failed to delete organization';
            this.snackBar.open(errorMsg, 'Close', { duration: 5000 });
          }
        });
      }
    });
  }

  addUser(): void {
    if (!this.organization) return;

    const dialogRef = this.dialog.open(UserAddDialogComponent, {
      width: '500px',
      data: { organizationId: this.organization.id }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.organizationService.addUserToOrganization(
          this.organization!.id, 
          result.userId, 
          result.role
        ).subscribe({
          next: () => {
            this.snackBar.open('User added to organization successfully', 'Close', { duration: 3000 });
            this.loadOrganizationData();
          },
          error: (err) => {
            const errorMsg = err.error?.message || 'Failed to add user to organization';
            this.snackBar.open(errorMsg, 'Close', { duration: 5000 });
          }
        });
      }
    });
  }

  removeUser(userId: number, userName: string): void {
    if (!this.organization) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Remove User',
        message: `Are you sure you want to remove ${userName} from this organization?`,
        confirmButtonText: 'Remove',
        cancelButtonText: 'Cancel',
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.organizationService.removeUserFromOrganization(this.organization!.id, userId).subscribe({
          next: () => {
            this.snackBar.open('User removed from organization successfully', 'Close', { duration: 3000 });
            this.loadOrganizationData();
          },
          error: (err) => {
            const errorMsg = err.error?.message || 'Failed to remove user from organization';
            this.snackBar.open(errorMsg, 'Close', { duration: 5000 });
          }
        });
      }
    });
  }

  updateUserRole(userId: number, userName: string, currentRole: string): void {
    if (!this.organization) return;

    const roles = ['admin', 'manager', 'auditor', 'user'];
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Change User Role',
        message: `Select new role for ${userName}:`,
        options: roles.filter(r => r !== currentRole).map(r => ({ value: r, label: r.charAt(0).toUpperCase() + r.slice(1) })),
        confirmButtonText: 'Update',
        cancelButtonText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.organizationService.updateUserRole(this.organization!.id, userId, result).subscribe({
          next: () => {
            this.snackBar.open('User role updated successfully', 'Close', { duration: 3000 });
            this.loadOrganizationData();
          },
          error: (err) => {
            const errorMsg = err.error?.message || 'Failed to update user role';
            this.snackBar.open(errorMsg, 'Close', { duration: 5000 });
          }
        });
      }
    });
  }

  editUser(userId: number): void {
    this.router.navigate([`/users/${userId}/edit`]);
  }

  viewUserProfile(userId: number): void {
    this.router.navigate([`/users/${userId}`]);
  }

  getStatusClass(isActive: boolean): string {
    return isActive ? 'status-active' : 'status-inactive';
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

  goBack(): void {
    this.router.navigate(['/organizations']);
  }
} 