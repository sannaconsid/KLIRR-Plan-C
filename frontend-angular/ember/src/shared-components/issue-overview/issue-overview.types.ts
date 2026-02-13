export interface IssueOverviewData {
  id: number;
  title: string;
  description: string;
  status?: string;
  events?: IssueEvent[];
}

export interface IssueEvent {
  timestamp: string | Date;
  detail: string;
}