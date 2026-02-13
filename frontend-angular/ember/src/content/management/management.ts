import { Component } from '@angular/core';
import { IssueOverview } from '../../shared-components/issue-overview/issue-overview';
import { IssueOverviewData } from '../../shared-components/issue-overview/issue-overview.types';

@Component({
  selector: 'app-management',
  imports: [ IssueOverview ],
  templateUrl: './management.html',
  styleUrl: './management.scss',
})
export class ManagementComponent {
  issues: IssueOverviewData[] = [];

  ngOnInit() {
    this.issues = [
      { id: 1, title: 'Issue 1', description: 'Description of Issue 1', events: [ 
        { timestamp: '2024-01-01T10:00:00Z', detail: 'Issue created' },
        { timestamp: '2024-01-02T12:00:00Z', detail: 'Initial investigation completed' },
        { timestamp: '2024-01-03T14:00:00Z', detail: 'Fix deployed' },
      ] },
      { id: 2, title: 'Issue 2', description: 'Description of Issue 2' },
      { id: 3, title: 'Issue 3', description: 'Description of Issue 3' },
    ]
  }
}
