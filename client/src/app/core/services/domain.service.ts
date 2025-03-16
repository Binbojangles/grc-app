import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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

  getDomainById(id: string): Observable<Domain> {
    return this.http.get<Domain>(`${this.apiUrl}/${id}`);
  }

  getDomainControls(domainId: string, level?: string): Observable<any[]> {
    let params = new HttpParams();
    if (level) {
      params = params.set('level', level);
    }
    
    return this.http.get<any[]>(`${this.apiUrl}/${domainId}/controls`, { params });
  }

  createDomain(domain: Partial<Domain>): Observable<Domain> {
    return this.http.post<Domain>(this.apiUrl, domain);
  }

  updateDomain(id: string, domain: Partial<Domain>): Observable<Domain> {
    return this.http.put<Domain>(`${this.apiUrl}/${id}`, domain);
  }

  deleteDomain(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
} 