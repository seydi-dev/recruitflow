import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { JobService } from './job.service';
import { environment } from '../../../environments/environment';
import { CreateJobRequest, Job, PagedResult, UpdateJobRequest } from '../models/job.model';

describe('JobService', () => {
  let service: JobService;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/jobs`;

  const mockJob: Job = {
    id: 'job-1',
    title: 'Développeur Full-Stack .NET / Angular',
    description: 'Poste senior full-stack',
    department: 'TI',
    location: 'Montréal, QC',
    status: 'Published',
    salaryMin: 85000,
    salaryMax: 110000,
    postedAt: '2026-03-25T10:00:00Z',
    createdByFullName: 'Admin User',
    applicationCount: 4
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        JobService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(JobService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch all jobs without query params', () => {
    const response: PagedResult<Job> = {
      items: [mockJob],
      totalCount: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
      hasNext: false,
      hasPrevious: false
    };

    let actual: PagedResult<Job> | undefined;

    service.getAll().subscribe(res => {
      actual = res;
    });

    const req = httpMock.expectOne(r => r.url === apiUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.keys().length).toBe(0);

    req.flush(response);

    expect(actual).toEqual(response);
  });

  it('should fetch all jobs with query params', () => {
    service.getAll({
      search: 'Angular',
      department: 'TI',
      page: 2,
      pageSize: 12
    }).subscribe();

    const req = httpMock.expectOne(r => r.url === apiUrl);
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('search')).toBe('Angular');
    expect(req.request.params.get('department')).toBe('TI');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('pageSize')).toBe('12');

    req.flush({
      items: [],
      totalCount: 0,
      page: 2,
      pageSize: 12,
      totalPages: 0,
      hasNext: false,
      hasPrevious: true
    });
  });

  it('should fetch published jobs', () => {
    let actual: Job[] | undefined;

    service.getPublished().subscribe(res => {
      actual = res;
    });

    const req = httpMock.expectOne(`${apiUrl}/published`);
    expect(req.request.method).toBe('GET');

    req.flush([mockJob]);

    expect(actual).toEqual([mockJob]);
  });

  it('should fetch a job by id', () => {
    let actual: Job | undefined;

    service.getById('job-1').subscribe(res => {
      actual = res;
    });

    const req = httpMock.expectOne(`${apiUrl}/job-1`);
    expect(req.request.method).toBe('GET');

    req.flush(mockJob);

    expect(actual).toEqual(mockJob);
  });

  it('should create a job', () => {
    const dto: CreateJobRequest = {
      title: 'Architecte .NET',
      description: 'Conception backend moderne',
      department: 'Architecture',
      location: 'Québec, QC',
      salaryMin: 95000,
      salaryMax: 125000,
      publishImmediately: true
    };

    let actual: Job | undefined;

    service.create(dto).subscribe(res => {
      actual = res;
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(dto);

    req.flush({
      ...mockJob,
      id: 'job-2',
      title: dto.title,
      description: dto.description,
      department: dto.department,
      location: dto.location,
      salaryMin: dto.salaryMin,
      salaryMax: dto.salaryMax
    });

    expect(actual?.id).toBe('job-2');
    expect(actual?.title).toBe(dto.title);
  });

  it('should update a job', () => {
    const dto: UpdateJobRequest = {
      title: 'Développeur Angular Senior',
      location: 'Télétravail hybride'
    };

    let actual: Job | undefined;

    service.update('job-1', dto).subscribe(res => {
      actual = res;
    });

    const req = httpMock.expectOne(`${apiUrl}/job-1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(dto);

    req.flush({
      ...mockJob,
      title: 'Développeur Angular Senior',
      location: 'Télétravail hybride'
    });

    expect(actual?.title).toBe('Développeur Angular Senior');
    expect(actual?.location).toBe('Télétravail hybride');
  });

  it('should update job status', () => {
    let actual: Job | undefined;

    service.updateStatus('job-1', 'Closed').subscribe(res => {
      actual = res;
    });

    const req = httpMock.expectOne(`${apiUrl}/job-1/status`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ status: 'Closed' });

    req.flush({
      ...mockJob,
      status: 'Closed'
    });

    expect(actual?.status).toBe('Closed');
  });

  it('should delete a job', () => {
    let completed = false;

    service.delete('job-1').subscribe(() => {
      completed = true;
    });

    const req = httpMock.expectOne(`${apiUrl}/job-1`);
    expect(req.request.method).toBe('DELETE');

    req.flush(null);

    expect(completed).toBe(true);
  });
});
