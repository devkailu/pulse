// client/src/services/auth.ts
import { api } from './api';

export interface SignupUserPayload {
  username: string;
  email: string;
  password: string;
  display_name?: string;
  subscription_id?: number;
  avatar_url?: string;
}

export interface SignupArtistPayload {
  username: string;
  email: string;
  password: string;
  stage_name: string;
  bio?: string;
  country?: string;
  start_year?: number;
  avatar_url?: string;
}

export interface LoginPayload {
  usernameOrEmail: string;
  password: string;
  accountType?: 'user' | 'artist';
}

export interface UserResponse {
  user: any;
  token: string;
}

export const signupUser = (payload: SignupUserPayload | FormData): Promise<UserResponse> =>
  api.post('/api/auth/signup-user', payload, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data);

export const signupArtist = (payload: SignupArtistPayload | FormData): Promise<UserResponse> =>
  api.post('/api/auth/signup-artist', payload, { headers: { 'Content-Type': 'multipart/form-data' } }).then(res => res.data);

export const login = (payload: LoginPayload): Promise<UserResponse> =>
  api.post('/api/auth/login', payload).then(res => res.data);

export const me = (): Promise<{ user: any }> =>
  api.get('/api/auth/me').then(res => res.data);

export const logout = (): Promise<{ ok: boolean }> =>
  api.post('/api/auth/logout').then(res => res.data);
