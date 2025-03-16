import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Organization {
  id: number;
  name: string;
  industry?: string | null;
  size?: string | null;
  cmmc_target_level: string;
  created_at: string;
  updated_at: string;
}

export interface OrganizationCreateDto {
  name: string;
  industry?: string;
  size?: string;
  cmmc_target_level: string;
}

export interface OrganizationUpdateDto {
  name?: string;
  industry?: string;
  size?: string;
  cmmc_target_level?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private apiUrl = `${environment.apiUrl}/organizations`;

  constructor(private http: HttpClient) { }

  getOrganizations(): Observable<Organization[]> {
    return this.http.get<Organization[]>(this.apiUrl);
  }

  getOrganizationById(id: number): Observable<Organization> {
    return this.http.get<Organization>(`${this.apiUrl}/${id}`);
  }

  createOrganization(organization: OrganizationCreateDto): Observable<Organization> {
    return this.http.post<Organization>(this.apiUrl, organization);
  }

  updateOrganization(id: number, organization: OrganizationUpdateDto): Observable<Organization> {
    return this.http.put<Organization>(`${this.apiUrl}/${id}`, organization);
  }

  deleteOrganization(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getOrganizationUsers(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${id}/users`);
  }

  addUserToOrganization(organizationId: number, userId: number, role: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${organizationId}/users`, { userId, role });
  }

  removeUserFromOrganization(organizationId: number, userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${organizationId}/users/${userId}`);
  }

  updateUserRole(organizationId: number, userId: number, role: string): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${organizationId}/users/${userId}`, { role });
  }
} 