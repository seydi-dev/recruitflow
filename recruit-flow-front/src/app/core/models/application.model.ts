export type ApplicationStatus = 'Pending' | 'Reviewing' | 'Interview' | 'Offer' | 'Rejected' | 'Withdrawn';

export interface Application {
  id: string;
  status: ApplicationStatus;
  coverLetter?: string;
  resumeUrl?: string;
  appliedAt: string;
  jobId: string;
  jobTitle: string;
  candidateId: string;
  candidateFullName: string;
  candidateEmail: string;
  interviewCount: number;
}

export interface CreateApplicationRequest {
  jobId: string;
  coverLetter?: string;
  resumeUrl?: string;
}

export interface ApplicationQueryParams {
  jobId?: string;
  candidateId?: string;
  status?: ApplicationStatus;
  page?: number;
  pageSize?: number;
}
