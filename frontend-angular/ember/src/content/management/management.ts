import { Component, effect, inject, signal, Signal } from '@angular/core';
import { IssueOverview } from '../../shared-components/issue-overview/issue-overview';
import { IssueOverviewData } from '../../shared-components/issue-overview/issue-overview.types';
import { ManagementService } from './management.service';
import { MatButtonModule } from '@angular/material/button';
import { AddIssueDialog } from './add-issue-dialog/add-issue-dialog';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-management',
  imports: [ IssueOverview, MatButtonModule ],
  templateUrl: './management.html',
  styleUrl: './management.scss',
})
export class ManagementComponent {
  public issues!: Signal<IssueOverviewData[] | undefined>;

  readonly dialog = inject(MatDialog);

  private service = inject(ManagementService);

  constructor() {
    effect(() => {
      this.issues = this.service.getIssuesSingal();
    });
  }

  addIssue() {
    const dialogRef = this.dialog.open(AddIssueDialog, {
      data: {name: undefined },
    });

    dialogRef.afterClosed().subscribe(result => {
      this.service.saveIssue(result).subscribe(() => {
        this.issues = this.service.getIssuesSingal();
      });
    });
  } 

}
