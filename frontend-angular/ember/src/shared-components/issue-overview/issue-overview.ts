import { Component, input, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { IssueOverviewData } from './issue-overview.types';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-issue-overview',
  imports: [MatCardModule, DatePipe],
  templateUrl: './issue-overview.html',
  styleUrl: './issue-overview.scss',

})
export class IssueOverview {
  issue = input<IssueOverviewData>();

}
