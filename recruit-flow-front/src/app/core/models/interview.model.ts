export type InterviewType = 'Phone' | 'Video' | 'OnSite';
export type InterviewStatus = 'Scheduled' | 'Completed' | 'Cancelled' | 'NoShow';

export interface Interview {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  type: InterviewType;
  meetingUrl?: string;
  notes?: string;
  status: InterviewStatus;
  applicationId: string;
  candidateFullName: string;
  jobTitle: string;
  interviewerFullName: string;
  evaluation?: EvaluationSummary;
}

export interface EvaluationSummary {
  id: string;
  averageScore: number;
  recommendation: string;
}

export interface CreateInterviewRequest {
  applicationId: string;
  interviewerId: string;
  scheduledAt: string;
  durationMinutes: number;
  type: InterviewType;
  meetingUrl?: string;
}
