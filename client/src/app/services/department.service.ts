import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Department {
  id?: number;
  name: string;
  description: string;
  organization_id: number;
  parent_department_id?: number;
  created_at?: string;
  updated_at?: string;
  organization_name?: string;
  parent_department_name?: string;
  user_count?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  private apiUrl = `${environment.apiUrl}/departments`;

  constructor(private http: HttpClient) { }

  /**
   * Get departments for an organization
   */
  getDepartments(organizationId: number): Observable<Department[]> {
    const params = new HttpParams().set('organizationId', organizationId.toString());
    return this.http.get<Department[]>(this.apiUrl, { params });
  }

  /**
   * Get a specific department by ID
   */
  getDepartment(id: number): Observable<Department> {
    return this.http.get<Department>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new department
   */
  createDepartment(department: Department): Observable<Department> {
    return this.http.post<Department>(this.apiUrl, department);
  }

  /**
   * Update a department
   */
  updateDepartment(id: number, department: Department): Observable<Department> {
    return this.http.put<Department>(`${this.apiUrl}/${id}`, department);
  }

  /**
   * Delete a department
   */
  deleteDepartment(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Get departments as a hierarchical structure
   */
  getDepartmentHierarchy(organizationId: number): Observable<Department[]> {
    const params = new HttpParams()
      .set('organizationId', organizationId.toString())
      .set('hierarchical', 'true');
    return this.http.get<Department[]>(this.apiUrl, { params });
  }
} 