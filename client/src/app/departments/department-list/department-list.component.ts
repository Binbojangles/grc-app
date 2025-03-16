import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';

import { Department, DepartmentService } from '../../services/department.service';
import { OrganizationService } from '../../services/organization.service';
import { DepartmentFormComponent } from '../department-form/department-form.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-department-list',
  templateUrl: './department-list.component.html',
  styleUrls: ['./department-list.component.scss']
})
export class DepartmentListComponent implements OnInit {
  dataSource = new MatTableDataSource<Department>([]);
  displayedColumns: string[] = ['name', 'description', 'organization_name', 'parent_department_name', 'user_count', 'actions'];
  isLoading = true;
  organizationId: number = 0; // Initialize with a default value

  @ViewChild(MatPaginator) paginator!: MatPaginator; // Non-null assertion
  @ViewChild(MatSort) sort!: MatSort; // Non-null assertion

  constructor(
    private departmentService: DepartmentService,
    private organizationService: OrganizationService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    // Get organization ID from route or user's organization
    this.route.queryParams.subscribe(params => {
      if (params['organizationId']) {
        this.organizationId = +params['organizationId'];
        this.loadDepartments();
      } else {
        // Default to user's organization
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            if (user && user.organization_id) {
              this.organizationId = user.organization_id;
              this.loadDepartments();
            }
          } catch (error) {
            console.error('Error parsing user data from localStorage', error);
          }
        }
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadDepartments() {
    this.isLoading = true;
    this.departmentService.getDepartments(this.organizationId).subscribe({
      next: (departments) => {
        this.dataSource.data = departments;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading departments', error);
        this.snackBar.open('Error loading departments', 'Close', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  openDepartmentForm(department?: Department) {
    const dialogRef = this.dialog.open(DepartmentFormComponent, {
      width: '600px',
      data: {
        department: department || { organization_id: this.organizationId },
        organizationId: this.organizationId
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadDepartments();
      }
    });
  }

  confirmDelete(department: Department) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirm Delete',
        message: `Are you sure you want to delete the department "${department.name}"?`,
        confirmText: 'Delete',
        cancelText: 'Cancel'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && department.id !== undefined) {
        this.departmentService.deleteDepartment(department.id).subscribe({
          next: () => {
            this.snackBar.open('Department deleted successfully', 'Close', { duration: 3000 });
            this.loadDepartments();
          },
          error: (error) => {
            console.error('Error deleting department', error);
            this.snackBar.open('Error deleting department', 'Close', { duration: 5000 });
          }
        });
      }
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
} 