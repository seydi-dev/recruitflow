export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  accessToken: string;
  expiresIn: number;
  user: UserInfo;
}

export interface UserInfo {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'Admin' | 'Recruiter' | 'Candidate';
}

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  exp: number;
}
