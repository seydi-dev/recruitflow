import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Job, CreateJobRequest, UpdateJobRequest, JobQueryParams, PagedResult } from '../models/job.model';

@Injectable({ providedIn: 'root' })
export class JobService {
  private http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/jobs`;

  getAll(query: JobQueryParams = {}) {
    let params = new HttpParams();
    if (query.search)     params = params.set('search', query.search);
    if (query.department) params = params.set('department', query.department);
    if (query.page)       params = params.set('page', query.page.toString());
    if (query.pageSize)   params = params.set('pageSize', query.pageSize.toString());
    return this.http.get<PagedResult<Job>>(this.API, { params });
  }

  getPublished() {
    return this.http.get<Job[]>(`${this.API}/published`);
  }

  getById(id: string) {
    return this.http.get<Job>(`${this.API}/${id}`);
  }

  create(dto: CreateJobRequest) {
    return this.http.post<Job>(this.API, dto);
  }

  update(id: string, dto: UpdateJobRequest) {
    return this.http.put<Job>(`${this.API}/${id}`, dto);
  }

  updateStatus(id: string, status: string) {
    return this.http.patch<Job>(`${this.API}/${id}/status`, { status });
  }

  delete(id: string) {
    return this.http.delete<void>(`${this.API}/${id}`);
  }
}
