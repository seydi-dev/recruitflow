export interface Job {
  id: string;
  title: string;
  description: string;
  department: string;
  location: string;
  status: 'Draft' | 'Published' | 'Closed';
  salaryMin?: number;
  salaryMax?: number;
  postedAt: string;
  closedAt?: string;
  createdByFullName: string;
  applicationCount: number;
}

export interface CreateJobRequest {
  title: string;
  description: string;
  department: string;
  location: string;
  salaryMin?: number;
  salaryMax?: number;
  publishImmediately: boolean;
}

export interface UpdateJobRequest {
  title?: string;
  description?: string;
  department?: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
}

export interface JobQueryParams {
  search?: string;
  department?: string;
  page?: number;
  pageSize?: number;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
