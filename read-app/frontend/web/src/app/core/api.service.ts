import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export type Stats = { want: number; read: number };

export type ExternalBook = {
  source: 'GOOGLE';
  externalId: string;
  title: string;
  authors: string[];
  categories: string[];
  thumbnail: string | null;
  userStatus?: 'WANT' | 'READ' | null;
};

export type ExternalSearchResponse = {
  items: ExternalBook[];
  total: number;
};

export type AddBookPayload = {
  source: 'GOOGLE';
  externalId: string;
  title: string;
  authors: string[];
  thumbnail: string | null;
  categories: string[];
  status: 'WANT' | 'READ';
};

export type UserSearchItem = {
  id: string;
  username: string;
  avatarUrl: string | null;
  friendshipStatus: 'NONE' | 'PENDING' | 'ACCEPTED';
  requestId: string | null;
  direction: 'OUTGOING' | 'INCOMING' | null;
};

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly baseUrl = '/api';

  constructor(private http: HttpClient) {}

  stats(): Observable<Stats> {
    return this.http.get<Stats>(`${this.baseUrl}/me/stats`);
  }

  searchExternal(
    q: string,
    page: number = 0,
  ): Observable<ExternalSearchResponse> {
    const params = new HttpParams().set('q', q).set('page', page.toString());

    return this.http.get<ExternalSearchResponse>(
      `${this.baseUrl}/external/books`,
      { params },
    );
  }

  addToMyBooks(payload: AddBookPayload): Observable<{ item: any }> {
    return this.http.post<{ item: any }>(`${this.baseUrl}/me/books`, payload);
  }

  myBooks(status?: 'WANT' | 'READ'): Observable<{ items: any[] }> {
    let params = new HttpParams();

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<{ items: any[] }>(`${this.baseUrl}/me/books`, {
      params,
    });
  }

  searchUsers(q: string): Observable<{ items: UserSearchItem[] }> {
    const params = new HttpParams().set('q', q);

    return this.http.get<{ items: UserSearchItem[] }>(`${this.baseUrl}/users`, {
      params,
    });
  }

  userProfile(userId: string) {
    return this.http.get<{
      user: { id: string; username: string; avatarUrl: string | null };
      canViewProfile: boolean;
      stats: Stats | null;
      friendshipStatus: 'NONE' | 'PENDING' | 'ACCEPTED';
      requestId: string | null;
      direction: 'OUTGOING' | 'INCOMING' | null;
    }>(`${this.baseUrl}/users/${userId}`);
  }

  userBooks(userId: string, status?: 'WANT' | 'READ') {
    let params = new HttpParams();

    if (status) {
      params = params.set('status', status);
    }

    return this.http.get<{ items: any[] }>(
      `${this.baseUrl}/users/${userId}/books`,
      {
        params,
      },
    );
  }

  requestFriend(userId: string) {
    return this.http.post<{ item: any }>(
      `${this.baseUrl}/users/${userId}/friend-request`,
      {},
    );
  }

  friends() {
    return this.http.get<{ items: UserSearchItem[] }>(
      `${this.baseUrl}/me/friends`,
    );
  }

  friendRequests() {
    return this.http.get<{
      incoming: UserSearchItem[];
      outgoing: UserSearchItem[];
    }>(`${this.baseUrl}/me/friend-requests`);
  }

  acceptFriendRequest(requestId: string) {
    return this.http.post<{ item: any }>(
      `${this.baseUrl}/me/friend-requests/${requestId}/accept`,
      {},
    );
  }

  deleteFriendRequest(requestId: string) {
    return this.http.delete<{ ok: boolean }>(
      `${this.baseUrl}/me/friend-requests/${requestId}`,
    );
  }

  rateBook(id: string, rating: number) {
    return this.http.patch<{ item: any }>(`/api/me/books/${id}/rating`, {
      rating,
    });
  }

  removeBook(id: string) {
    return this.http.delete<{ ok: boolean }>(`${this.baseUrl}/me/books/${id}`);
  }

  login(email: string, password: string) {
    return this.http.post<{ token: string }>(`${this.baseUrl}/auth/login`, {
      email,
      password,
    });
  }

  register(email: string, password: string) {
    return this.http.post(`${this.baseUrl}/auth/register`, {
      email,
      password,
    });
  }

  changePassword(currentPassword: string, newPassword: string) {
    return this.http.post<{ ok: boolean }>(
      `${this.baseUrl}/me/change-password`,
      {
        currentPassword,
        newPassword,
      },
    );
  }

  getInsights() {
    return this.http.get<{
      genres: { name: string; count: number }[];
      topRated: any[];
    }>('/api/me/insights');
  }

  getFeed() {
    return this.http.get<{ items: any[] }>('/api/me/feed');
  }
}
