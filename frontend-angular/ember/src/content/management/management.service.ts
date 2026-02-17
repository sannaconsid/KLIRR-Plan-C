import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../app/app.config';

@Injectable({providedIn: 'root'})
export class ManagementService {
  private client = inject(HttpClient);
  private baseURL = inject(API_BASE_URL);

  private issues = signal<any[] | undefined>(undefined);

  saveIssue(name: string): Observable<any> {
    return this.client.post<any>(this.baseURL + '/issue', { title: name });
  }

  getIssuesSingal(){
    this.client.get<any[]>(this.baseURL + '/issue').subscribe((data) => {
      this.issues.set(data)
    });

    return this.issues;
  }
}
