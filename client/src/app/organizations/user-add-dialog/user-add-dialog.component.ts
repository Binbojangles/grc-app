import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserService, User } from '../../services/user.service';
import { Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';

@Component({
  selector: 'app-user-add-dialog',
  templateUrl: './user-add-dialog.component.html',
  styleUrls: ['./user-add-dialog.component.scss']
})
export class UserAddDialogComponent implements OnInit {
  userForm: FormGroup;
  users: User[] = [];
  filteredUsers!: Observable<User[]>;
  roles: string[] = ['admin', 'manager', 'auditor', 'user'];
  isLoading = false;
  error = '';
  searchQuery = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private dialogRef: MatDialogRef<UserAddDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { organizationId: number }
  ) {
    this.userForm = this.fb.group({
      userId: ['', Validators.required],
      role: ['user', Validators.required]
    });
  }

  ngOnInit(): void {
    // Setup search whenever the userId field changes
    this.filteredUsers = this.userForm.get('userId')!.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        if (typeof value === 'string' && value.trim().length > 2) {
          this.isLoading = true;
          this.searchQuery = value;
          return this.userService.searchUsers(value).pipe(
            catchError(err => {
              this.error = 'Failed to search users. Please try again.';
              this.isLoading = false;
              console.error('Error searching users:', err);
              return of([]);
            })
          );
        }
        return of([]);
      }),
      catchError(() => of([]))
    );

    // Subscribe to the filtered users to update loading state
    this.filteredUsers.subscribe({
      next: (users) => {
        this.users = users;
        this.isLoading = false;
      }
    });
  }

  displayUser(user: User | null): string {
    return user ? `${user.email}` : '';
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      const formData = {
        userId: this.userForm.value.userId.id,
        role: this.userForm.value.role
      };
      
      this.dialogRef.close(formData);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
} 