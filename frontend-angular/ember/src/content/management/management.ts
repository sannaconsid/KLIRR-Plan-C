import { Component, effect, inject } from '@angular/core';
import { IssueOverview } from '../../shared-components/issue-overview/issue-overview';
import { IssueOverviewData } from '../../shared-components/issue-overview/issue-overview.types';
import { ManagementService } from './management.service';
import { Observable } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-management',
  imports: [ IssueOverview, AsyncPipe ],
  templateUrl: './management.html',
  styleUrl: './management.scss',
})
export class ManagementComponent {
  public issues$!: Observable<IssueOverviewData[]>;

  private service = inject(ManagementService);

  constructor() {
    effect(() => {
      this.issues$ = this.service.getIssues();
    });
  }

}
