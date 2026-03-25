import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Application, CreateApplicationRequest, ApplicationQueryParams } from '../models/application.model';
import { PagedResult } from '../models/job.model';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/applications`;

  getAll(query: ApplicationQueryParams = {}) {
    let params = new HttpParams();
    if (query.jobId)       params = params.set('jobId', query.jobId);
    if (query.candidateId) params = params.set('candidateId', query.candidateId);
    if (query.status)      params = params.set('status', query.status);
    if (query.page)        params = params.set('page', query.page.toString());
    if (query.pageSize)    params = params.set('pageSize', query.pageSize.toString());
    return this.http.get<PagedResult<Application>>(this.API, { params });
  }

  getById(id: string) {
    return this.http.get<Application>(`${this.API}/${id}`);
  }

  apply(dto: CreateApplicationRequest) {
    return this.http.post<Application>(this.API, dto);
  }

  updateStatus(id: string, status: string) {
    return this.http.patch<Application>(`${this.API}/${id}/status`, { status });
  }

  withdraw(id: string) {
    return this.http.post<void>(`${this.API}/${id}/withdraw`, {});
  }
}
