import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/auth.model';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let router: Router;

  const apiUrl = `${environment.apiUrl}/auth`;

  const authResponse: AuthResponse = {
    accessToken: 'header.payload.signature',
    expiresIn: 900,
    user: {
      id: 'user-1',
      email: 'admin@recruitflow.dev',
      firstName: 'Admin',
      lastName: 'User',
      role: 'Admin'
    }
  };

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);

    jest.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    jest.restoreAllMocks();
  });

  it('should initialize currentUser from localStorage', () => {
    localStorage.setItem(
      'user_info',
      JSON.stringify({
        id: 'u1',
        email: 'recruiter@recruitflow.dev',
        firstName: 'Recruiter',
        lastName: 'User',
        role: 'Recruiter'
      })
    );

    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    const freshService = TestBed.inject(AuthService);

    expect(freshService.currentUser()).toEqual({
      id: 'u1',
      email: 'recruiter@recruitflow.dev',
      firstName: 'Recruiter',
      lastName: 'User',
      role: 'Recruiter'
    });
    expect(freshService.isAuthenticated()).toBe(true);
    expect(freshService.isRecruiter()).toBe(true);
    expect(freshService.isAdmin()).toBe(false);
  });

  it('should login, persist auth data and navigate to dashboard', () => {
    const payload: LoginRequest = {
      email: 'admin@recruitflow.dev',
      password: 'Admin123!'
    };

    let actualResponse: AuthResponse | undefined;

    service.login(payload).subscribe(response => {
      actualResponse = response;
    });

    const req = httpMock.expectOne(`${apiUrl}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);

    req.flush(authResponse);

    expect(actualResponse).toEqual(authResponse);
    expect(localStorage.getItem('access_token')).toBe(authResponse.accessToken);
    expect(localStorage.getItem('user_info')).toBe(JSON.stringify(authResponse.user));

    expect(service.currentUser()).toEqual(authResponse.user);
    expect(service.isAuthenticated()).toBe(true);
    expect(service.isAdmin()).toBe(true);
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should register, persist auth data and navigate to dashboard', () => {
    const payload: RegisterRequest = {
      email: 'candidate@recruitflow.dev',
      password: 'Candidate123!',
      firstName: 'Jane',
      lastName: 'Doe'
    };

    let actualResponse: AuthResponse | undefined;

    service.register(payload).subscribe(response => {
      actualResponse = response;
    });

    const req = httpMock.expectOne(`${apiUrl}/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);

    req.flush({
      ...authResponse,
      user: {
        id: 'candidate-1',
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        role: 'Candidate'
      }
    });

    expect(actualResponse?.user.email).toBe(payload.email);
    expect(localStorage.getItem('access_token')).toBeTruthy();
    expect(service.isCandidate()).toBe(true);
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should call refresh endpoint with credentials and update auth state', () => {
    let actualResponse: AuthResponse | undefined;

    service.refreshToken().subscribe(response => {
      actualResponse = response;
    });

    const req = httpMock.expectOne(`${apiUrl}/refresh`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({});
    expect(req.request.withCredentials).toBe(true);

    req.flush(authResponse);

    expect(actualResponse).toEqual(authResponse);
    expect(localStorage.getItem('access_token')).toBe(authResponse.accessToken);
    expect(service.currentUser()).toEqual(authResponse.user);
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should logout, call revoke endpoint, clear storage and navigate to login', () => {
    localStorage.setItem('access_token', authResponse.accessToken);
    localStorage.setItem('user_info', JSON.stringify(authResponse.user));

    // On force un état cohérent via login interne
    (service as any)._currentUser.set(authResponse.user);

    service.logout();

    const req = httpMock.expectOne(`${apiUrl}/revoke`);
    expect(req.request.method).toBe('POST');
    expect(req.request.withCredentials).toBe(true);
    req.flush({});

    expect(localStorage.getItem('access_token')).toBeNull();
    expect(localStorage.getItem('user_info')).toBeNull();
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBe(false);
    expect(router.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should return access token from localStorage', () => {
    localStorage.setItem('access_token', 'my-token');
    expect(service.getAccessToken()).toBe('my-token');
  });

  it('should return true when token is missing', () => {
    expect(service.isTokenExpired()).toBe(true);
  });

  it('should return false when token is valid', () => {
    const futureExp = Math.floor(Date.now() / 1000) + 3600;
    const payload = btoa(JSON.stringify({
      sub: 'u1',
      email: 'admin@recruitflow.dev',
      role: 'Admin',
      exp: futureExp
    }));

    localStorage.setItem('access_token', `header.${payload}.signature`);

    expect(service.isTokenExpired()).toBe(false);
  });

  it('should return true when token is expired', () => {
    const pastExp = Math.floor(Date.now() / 1000) - 3600;
    const payload = btoa(JSON.stringify({
      sub: 'u1',
      email: 'admin@recruitflow.dev',
      role: 'Admin',
      exp: pastExp
    }));

    localStorage.setItem('access_token', `header.${payload}.signature`);

    expect(service.isTokenExpired()).toBe(true);
  });

  it('should return true when token payload is malformed', () => {
    localStorage.setItem('access_token', 'invalid-token');
    expect(service.isTokenExpired()).toBe(true);
  });
});
