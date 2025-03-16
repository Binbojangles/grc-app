import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User } from './user.service';

export interface Organization {
  id: number;
  name: string;
  industry: string | null;
  size: string | null;
  address: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private apiUrl = `${environment.apiUrl}/organizations`;

  constructor(private http: HttpClient) { }

  /**
   * Get all organizations
   */
  getOrganizations(): Observable<Organization[]> {
    return this.http.get<Organization[]>(this.apiUrl);
  }

  /**
   * Get organization by ID
   * @param id Organization ID
   */
  getOrganizationById(id: number): Observable<Organization> {
    return this.http.get<Organization>(`${this.apiUrl}/${id}`);
  }

  /**
   * Create a new organization
   * @param organization Organization data
   */
  createOrganization(organization: any): Observable<Organization> {
    return this.http.post<Organization>(this.apiUrl, organization);
  }

  /**
   * Update an existing organization
   * @param id Organization ID
   * @param organization Organization data to update
   */
  updateOrganization(id: number, organization: any): Observable<Organization> {
    return this.http.put<Organization>(`${this.apiUrl}/${id}`, organization);
  }

  /**
   * Delete an organization
   * @param id Organization ID
   */
  deleteOrganization(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  /**
   * Get users belonging to an organization
   * @param id Organization ID
   */
  getOrganizationUsers(id: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/${id}/users`);
  }
} 