import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Organization, OrganizationService } from '../../services/organization.service';

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
  parentOrgOptions: Organization[] = [];
  loading = true;
  currentOrgId?: number;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<OrganizationEditDialogComponent>,
    private organizationService: OrganizationService,
    @Inject(MAT_DIALOG_DATA) public data: { organization?: Organization }
  ) {
    this.isEditMode = !!data.organization;
    this.dialogTitle = this.isEditMode ? 'Edit Organization' : 'Create Organization';
    this.currentOrgId = data.organization?.id;
    
    this.organizationForm = this.fb.group({
      name: [data.organization?.name || '', [Validators.required, Validators.maxLength(100)]],
      industry: [data.organization?.industry || '', Validators.maxLength(100)],
      size: [data.organization?.size || '', Validators.maxLength(50)],
      cmmc_target_level: [data.organization?.cmmc_target_level || 'Level 1', Validators.required],
      parent_organization_id: [data.organization?.parent_organization_id || null]
    });
  }

  ngOnInit(): void {
    this.loadParentOptions();
  }

  loadParentOptions(): void {
    this.loading = true;
    this.organizationService.getOrganizations().subscribe({
      next: (organizations) => {
        // Filter out the current organization (if in edit mode) to prevent circular references
        this.parentOrgOptions = organizations.filter(org => 
          !this.isEditMode || org.id !== this.currentOrgId
        );
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading organizations', error);
        this.loading = false;
      }
    });
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