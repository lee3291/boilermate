export interface BugReportDetails {
  id: string;
  title: string;
  description: string;
  steps: string;
  userId: string;
  status: string;
  priority: string | null;
  createdAt: Date;
  updatedAt: Date;
}


