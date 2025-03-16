import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Department, DepartmentService } from '../../services/department.service';
import { OrganizationService } from '../../services/organization.service';

interface DialogData {
  department: Department;
  organizationId: number;
}

@Component({
  selector: 'app-department-form',
  templateUrl: './department-form.component.html',
  styleUrls: ['./department-form.component.scss']
})
export class DepartmentFormComponent implements OnInit {
  departmentForm!: FormGroup;
  isLoading = false;
  isSubmitting = false;
  parentDepartments: Department[] = [];
  isEdit = false;

  constructor(
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    private organizationService: OrganizationService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<DepartmentFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) { }

  ngOnInit(): void {
    this.isEdit = !!this.data.department.id;

    this.departmentForm = this.fb.group({
      name: [this.data.department.name || '', [Validators.required, Validators.maxLength(255)]],
      description: [this.data.department.description || ''],
      organization_id: [this.data.department.organization_id, Validators.required],
      parent_department_id: [this.data.department.parent_department_id || null]
    });

    this.loadParentDepartments();
  }

  loadParentDepartments() {
    this.isLoading = true;
    this.departmentService.getDepartments(this.data.organizationId).subscribe({
      next: (departments) => {
        // Filter out current department (for edit mode) and descendants to prevent circular references
        if (this.isEdit) {
          this.parentDepartments = departments.filter(d => d.id !== this.data.department.id);
        } else {
          this.parentDepartments = departments;
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading parent departments', error);
        this.snackBar.open('Error loading parent departments', 'Close', { duration: 5000 });
        this.isLoading = false;
      }
    });
  }

  onSubmit() {
    if (this.departmentForm.invalid) {
      return;
    }

    const formData = this.departmentForm.value;
    this.isSubmitting = true;

    if (this.isEdit && this.data.department.id !== undefined) {
      this.departmentService.updateDepartment(this.data.department.id, formData).subscribe({
        next: (result) => {
          this.snackBar.open('Department updated successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(result);
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error updating department', error);
          this.snackBar.open('Error updating department', 'Close', { duration: 5000 });
          this.isSubmitting = false;
        }
      });
    } else {
      this.departmentService.createDepartment(formData).subscribe({
        next: (result) => {
          this.snackBar.open('Department created successfully', 'Close', { duration: 3000 });
          this.dialogRef.close(result);
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Error creating department', error);
          this.snackBar.open('Error creating department', 'Close', { duration: 5000 });
          this.isSubmitting = false;
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 