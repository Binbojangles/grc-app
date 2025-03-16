import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmButtonText: string;
  cancelButtonText: string;
  color?: 'primary' | 'accent' | 'warn';
  options?: { value: string; label: string }[];
  selectedOption?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {
    // Set default values if not provided
    this.data.confirmButtonText = this.data.confirmButtonText || 'Confirm';
    this.data.cancelButtonText = this.data.cancelButtonText || 'Cancel';
    this.data.color = this.data.color || 'primary';
    
    // If options are provided, set initial selected option
    if (this.data.options && this.data.options.length > 0) {
      this.data.selectedOption = this.data.selectedOption || this.data.options[0].value;
    }
  }

  onConfirm(): void {
    // If options are provided, return the selected option
    if (this.data.options) {
      this.dialogRef.close(this.data.selectedOption);
    } else {
      this.dialogRef.close(true);
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
} 