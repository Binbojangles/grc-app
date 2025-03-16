import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
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
    let httpParams = new HttpParams();
    
    if (params) {
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
          httpParams = httpParams.set(key, params[key]);
        }
      });
    }
    
    return this.http.get<Control[]>(this.apiUrl, { params: httpParams });
  }

  getControlById(id: string): Observable<Control> {
    return this.http.get<Control>(`${this.apiUrl}/${id}`);
  }

  createControl(control: Partial<Control>): Observable<Control> {
    return this.http.post<Control>(this.apiUrl, control);
  }

  updateControl(id: string, control: Partial<Control>): Observable<Control> {
    return this.http.put<Control>(`${this.apiUrl}/${id}`, control);
  }

  deleteControl(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getControlsByDomain(domainId: string): Observable<Control[]> {
    return this.http.get<Control[]>(`${environment.apiUrl}/domains/${domainId}/controls`);
  }

  getControlsByLevel(level: string): Observable<Control[]> {
    return this.http.get<Control[]>(this.apiUrl, { params: { level } });
  }
} 