import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Organization } from '../../services/organization.service';

@Component({
  selector: 'app-organization-edit-dialog',
  templateUrl: './organization-edit-dialog.component.html',
  styleUrls: ['./organization-edit-dialog.component.scss']
})
export class OrganizationEditDialogComponent implements OnInit {
  organizationForm: FormGroup;
  isEditMode: boolean;
  dialogTitle: string;
  cmmcLevels = ['Level 1', 'Level 2', 'Level 3'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<OrganizationEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { organization?: Organization }
  ) {
    this.isEditMode = !!data.organization;
    this.dialogTitle = this.isEditMode ? 'Edit Organization' : 'Create Organization';
    
    this.organizationForm = this.fb.group({
      name: [data.organization?.name || '', [Validators.required, Validators.maxLength(100)]],
      industry: [data.organization?.industry || '', Validators.maxLength(100)],
      size: [data.organization?.size || '', Validators.maxLength(50)],
      cmmc_target_level: [data.organization?.cmmc_target_level || 'Level 1', Validators.required]
    });
  }

  ngOnInit(): void {
  }

  onSubmit(): void {
    if (this.organizationForm.valid) {
      const formData = this.organizationForm.value;
      
      // If in edit mode, include the organization ID
      if (this.isEditMode && this.data.organization) {
        formData.id = this.data.organization.id;
      }
      
      this.dialogRef.close(formData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 