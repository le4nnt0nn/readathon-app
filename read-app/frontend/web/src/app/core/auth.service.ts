import { Injectable } from '@angular/core';
import { BehaviorSubject, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export type AuthUser = { id: string; username: string; email: string; avatarUrl: string | null };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'bookocean_token';
  private userKey = 'bookocean_user';

  user$ = new BehaviorSubject<AuthUser | null>(this.loadUser());

  constructor(private http: HttpClient) {}

  get token(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.token;
  }

  register(payload: { username: string; email: string; password: string }) {
    return this.http.post<{ token: string; user: AuthUser }>('/api/auth/register', payload).pipe(
      tap(({ token, user }) => this.setSession(token, user))
    );
  }

  login(payload: { identifier: string; password: string }) {
    return this.http.post<{ token: string; user: AuthUser }>('/api/auth/login', payload).pipe(
      tap(({ token, user }) => this.setSession(token, user))
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.user$.next(null);
  }

  private setSession(token: string, user: AuthUser) {
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
    this.user$.next(user);
  }

  private loadUser(): AuthUser | null {
    const raw = localStorage.getItem(this.userKey);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  }
}
