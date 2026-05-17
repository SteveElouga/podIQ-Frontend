export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface CurrentUser {
  userId: string;
  email: string;
  exp: number;
}
