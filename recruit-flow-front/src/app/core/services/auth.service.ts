import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest, TokenPayload, UserInfo } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private _currentUser = signal<UserInfo | null>(this.loadUserFromStorage());

  readonly currentUser = this._currentUser.asReadonly();
  readonly isAuthenticated = computed(() => this._currentUser() !== null);
  readonly isAdmin = computed(() => this._currentUser()?.role === 'Admin');
  readonly isRecruiter = computed(() => ['Admin', 'Recruiter'].includes(this._currentUser()?.role ?? ''));
  readonly isCandidate = computed(() => this._currentUser()?.role === 'Candidate');

  private readonly API = `${environment.apiUrl}/auth`;

  login(credentials: LoginRequest) {
    return this.http.post<AuthResponse>(`${this.API}/login`, credentials).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  register(data: RegisterRequest) {
    return this.http.post<AuthResponse>(`${this.API}/register`, data).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  refreshToken() {
    return this.http.post<AuthResponse>(`${this.API}/refresh`, {}, { withCredentials: true }).pipe(
      tap(response => this.handleAuthResponse(response))
    );
  }

  logout() {
    this.http.post(`${this.API}/revoke`, {}, { withCredentials: true }).subscribe();
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_info');
    this._currentUser.set(null);
    this.router.navigate(['/auth/login']);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;
    try {
      const payload: TokenPayload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  private handleAuthResponse(response: AuthResponse): void {
    localStorage.setItem('access_token', response.accessToken);
    localStorage.setItem('user_info', JSON.stringify(response.user));
    this._currentUser.set(response.user);
    this.router.navigate(['/dashboard']); // ← ajouter cette ligne
  }

  private loadUserFromStorage(): UserInfo | null {
    try {
      const stored = localStorage.getItem('user_info');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
}
