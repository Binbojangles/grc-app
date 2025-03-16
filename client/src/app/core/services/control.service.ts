import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Control {
  id: number;
  control_id: string;
  domain_id: string;
  name: string;
  description: string;
  cmmc_level: string;
  assessment_objective: string;
  discussion: string;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class ControlService {
  private apiUrl = `${environment.apiUrl}/controls`;

  constructor(private http: HttpClient) { }

  getControls(params?: any): Observable<Control[]> {
    return this.http.get<Control[]>(this.apiUrl, { params });
  }

  getControl(id: string): Observable<Control> {
    return this.http.get<Control>(`${this.apiUrl}/${id}`);
  }

  getControlsByDomain(domainId: string): Observable<Control[]> {
    return this.http.get<Control[]>(`${environment.apiUrl}/domains/${domainId}/controls`);
  }

  getControlsByLevel(level: string): Observable<Control[]> {
    return this.http.get<Control[]>(this.apiUrl, { params: { level } });
  }

  // In a real app, we would have methods for creating, updating, and deleting controls
} 