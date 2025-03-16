import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Domain {
  id: number;
  domain_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class DomainService {
  private apiUrl = `${environment.apiUrl}/domains`;

  constructor(private http: HttpClient) { }

  getDomains(): Observable<Domain[]> {
    return this.http.get<Domain[]>(this.apiUrl);
  }

  getDomain(id: string): Observable<Domain> {
    return this.http.get<Domain>(`${this.apiUrl}/${id}`);
  }

  // In a real app, we would have methods for creating, updating, and deleting domains
  // as well as for managing related controls within each domain
} 