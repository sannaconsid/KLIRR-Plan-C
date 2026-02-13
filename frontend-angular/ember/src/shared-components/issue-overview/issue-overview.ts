import { Component, input, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { IssueOverviewData } from './issue-overview.types';

@Component({
  selector: 'app-issue-overview',
  imports: [MatCardModule],
  templateUrl: './issue-overview.html',
  styleUrl: './issue-overview.scss',

})
export class IssueOverview {
  issue = input<IssueOverviewData>();

}
