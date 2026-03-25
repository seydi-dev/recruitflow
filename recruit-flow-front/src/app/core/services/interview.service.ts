import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Interview, CreateInterviewRequest } from '../models/interview.model';

@Injectable({ providedIn: 'root' })
export class InterviewService {
  private http = inject(HttpClient);
  private readonly API = `${environment.apiUrl}/interviews`;

  getByApplication(applicationId: string) {
    return this.http.get<Interview[]>(`${this.API}/application/${applicationId}`);
  }

  getById(id: string) {
    return this.http.get<Interview>(`${this.API}/${id}`);
  }

  schedule(dto: CreateInterviewRequest) {
    return this.http.post<Interview>(this.API, dto);
  }

  cancel(id: string) {
    return this.http.post<void>(`${this.API}/${id}/cancel`, {});
  }
}
