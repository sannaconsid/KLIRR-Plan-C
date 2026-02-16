import { Component, inject, Injectable } from '@angular/core';
import { IssueOverview } from '../../shared-components/issue-overview/issue-overview';
import { IssueOverviewData } from '../../shared-components/issue-overview/issue-overview.types';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../../app/app.config';

@Injectable({providedIn: 'root'})
export class ManagementService {
  private client = inject(HttpClient);
  private baseURL = inject(API_BASE_URL);


  getIssues(): Observable<any[]> {

    return this.client.get<any[]>(this.baseURL + '/issue');
  }
}
