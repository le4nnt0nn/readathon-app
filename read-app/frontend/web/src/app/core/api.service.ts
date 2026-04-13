import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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

export type ExternalSearchResponse = { items: ExternalBook[]; total: number };

export type AddBookPayload = {
  source: 'GOOGLE';
  externalId: string;
  title: string;
  authors: string[];
  thumbnail: string | null;
  categories: string[];
  status: 'WANT' | 'READ';
};


@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  stats() {
    return this.http.get<Stats>('/api/me/stats');
  }

  searchExternal(q: string, page: number) {
    return this.http.get<ExternalSearchResponse>(`/api/external/books?q=${encodeURIComponent(q)}&page=${page}`);
  }

    addToMyBooks(payload: AddBookPayload) {
        return this.http.post<{ item: any }>('/api/me/books', payload);
  }

  myBooks(status?: 'WANT' | 'READ') {
    const qs = status ? `?status=${status}` : '';
    return this.http.get<{ items: any[] }>(`/api/me/books${qs}`);
  }

}
