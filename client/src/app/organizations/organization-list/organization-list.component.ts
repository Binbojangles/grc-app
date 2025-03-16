import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrganizationService, Organization } from '../../services/organization.service';
import { AuthService } from '../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { OrganizationEditDialogComponent } from '../organization-edit-dialog/organization-edit-dialog.component';

@Component({
  selector: 'app-organization-list',
  templateUrl: './organization-list.component.html',
  styleUrls: ['./organization-list.component.scss']
})
export class OrganizationListComponent implements OnInit {
  organizations: Organization[] = [];
  displayedColumns: string[] = ['name', 'industry', 'size', 'contact', 'actions'];
  isLoading = true;
  error: string | null = null;
  isAdmin = false;

  constructor(
    private organizationService: OrganizationService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadOrganizations();
  }

  loadOrganizations(): void {
    this.isLoading = true;
    this.error = null;
    
    this.organizationService.getOrganizations().subscribe({
      next: (data) => {
        this.organizations = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Failed to load organizations';
        this.isLoading = false;
        if (this.error) {
          this.snackBar.open(this.error, 'Close', { duration: 5000 });
        }
      }
    });
  }

  createOrganization(): void {
    const dialogRef = this.dialog.open(OrganizationEditDialogComponent, {
      width: '600px',
      data: { organization: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.organizationService.createOrganization(result).subscribe({
          next: () => {
            this.snackBar.open('Organization created successfully', 'Close', { duration: 3000 });
            this.loadOrganizations();
          },
          error: (err) => {
            const errorMsg = err.error?.message || 'Failed to create organization';
            this.snackBar.open(errorMsg, 'Close', { duration: 5000 });
          }
        });
      }
    });
  }

  editOrganization(org: Organization): void {
    const dialogRef = this.dialog.open(OrganizationEditDialogComponent, {
      width: '600px',
      data: { organization: org }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.organizationService.updateOrganization(org.id, result).subscribe({
          next: () => {
            this.snackBar.open('Organization updated successfully', 'Close', { duration: 3000 });
            this.loadOrganizations();
          },
          error: (err) => {
            const errorMsg = err.error?.message || 'Failed to update organization';
            this.snackBar.open(errorMsg, 'Close', { duration: 5000 });
          }
        });
      }
    });
  }

  viewOrganization(orgId: number): void {
    this.router.navigate([`/organizations/${orgId}`]);
  }

  deleteOrganization(org: Organization): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Organization',
        message: `Are you sure you want to delete ${org.name}? This cannot be undone.`,
        confirmButtonText: 'Delete',
        cancelButtonText: 'Cancel',
        color: 'warn'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.organizationService.deleteOrganization(org.id).subscribe({
          next: () => {
            this.snackBar.open('Organization deleted successfully', 'Close', { duration: 3000 });
            this.loadOrganizations();
          },
          error: (err) => {
            const errorMsg = err.error?.message || 'Failed to delete organization';
            this.snackBar.open(errorMsg, 'Close', { duration: 5000 });
          }
        });
      }
    });
  }
} 