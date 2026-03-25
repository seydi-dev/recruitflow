export interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pendingApplications: number;
  interviewsThisWeek: number;
  offersExtended: number;
  applicationsByStatus: Record<string, number>;
  topJobs: JobApplicationCount[];
}

export interface JobApplicationCount {
  jobTitle: string;
  count: number;
}
