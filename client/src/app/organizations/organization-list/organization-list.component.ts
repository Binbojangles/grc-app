import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { OrganizationService, Organization } from '../../services/organization.service';
import { AuthService } from '../../core/services/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { OrganizationEditDialogComponent } from '../organization-edit-dialog/organization-edit-dialog.component';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';

// Define the node interfaces for the hierarchy tree
interface OrganizationNode extends Organization {
  children?: OrganizationNode[];
}

interface FlatOrganizationNode {
  expandable: boolean;
  name: string;
  level: number;
  id: number;
  parent_organization_id?: number | null;
  industry?: string | null;
  size?: string | null;
  cmmc_target_level: string;
}

@Component({
  selector: 'app-organization-list',
  templateUrl: './organization-list.component.html',
  styleUrls: ['./organization-list.component.scss']
})
export class OrganizationListComponent implements OnInit {
  organizations: Organization[] = [];
  hierarchyData: OrganizationNode[] = [];
  displayedColumns: string[] = ['name', 'industry', 'size', 'cmmc_level', 'parent', 'actions'];
  isLoading = true;
  error: string | null = null;
  isAdmin = false;
  viewMode = 'list';

  // Tree Control setup
  private transformer = (node: OrganizationNode, level: number): FlatOrganizationNode => {
    return {
      expandable: !!node.children && node.children.length > 0,
      name: node.name,
      level: level,
      id: node.id,
      parent_organization_id: node.parent_organization_id,
      industry: node.industry,
      size: node.size,
      cmmc_target_level: node.cmmc_target_level
    };
  };

  treeControl = new FlatTreeControl<FlatOrganizationNode>(
    node => node.level,
    node => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this.transformer,
    node => node.level,
    node => node.expandable,
    node => node.children
  );

  hierarchyDataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

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
    this.loadOrganizationHierarchy();
  }

  hasChild = (_: number, node: FlatOrganizationNode) => node.expandable;

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

  loadOrganizationHierarchy(): void {
    this.organizationService.getOrganizationHierarchy().subscribe({
      next: (data) => {
        this.hierarchyData = data;
        this.hierarchyDataSource.data = data;
        // Expand the first level by default
        if (this.treeControl.dataNodes && this.treeControl.dataNodes.length > 0) {
          this.treeControl.dataNodes
            .filter(node => node.level === 0)
            .forEach(node => this.treeControl.expand(node));
        }
      },
      error: (err) => {
        console.error('Failed to load organization hierarchy', err);
        // We already show the error from loadOrganizations, so no need to display again
      }
    });
  }

  getParentName(parentId: number | null | undefined): string | null {
    if (!parentId) return null;
    const parent = this.organizations.find(org => org.id === parentId);
    return parent ? parent.name : null;
  }

  createOrganization(): void {
    const dialogRef = this.dialog.open(OrganizationEditDialogComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: { organization: null },
      disableClose: false,
      autoFocus: true,
      position: {
        top: '10vh',
        left: '50%'
      },
      panelClass: 'centered-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.organizationService.createOrganization(result).subscribe({
          next: () => {
            this.snackBar.open('Organization created successfully', 'Close', { duration: 3000 });
            this.loadOrganizations();
            this.loadOrganizationHierarchy();
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
      maxWidth: '90vw',
      data: { organization: org },
      disableClose: false,
      autoFocus: true,
      position: {
        top: '10vh',
        left: '50%'
      },
      panelClass: 'centered-dialog'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.organizationService.updateOrganization(org.id, result).subscribe({
          next: () => {
            this.snackBar.open('Organization updated successfully', 'Close', { duration: 3000 });
            this.loadOrganizations();
            this.loadOrganizationHierarchy();
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
            this.loadOrganizationHierarchy();
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