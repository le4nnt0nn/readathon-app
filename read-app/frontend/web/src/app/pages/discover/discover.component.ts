import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, ExternalBook } from '../../core/api.service';

@Component({
  selector: 'app-discover',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor],
  templateUrl: './discover.component.html',
})
export class DiscoverComponent {
  q = '';
  page = 0;
  loading = false;
  items: ExternalBook[] = [];
  total = 0;
  error: string | null = null;

  constructor(private api: ApiService) {}

  search(reset = true) {
    if (!this.q.trim()) return;
    this.error = null;
    this.loading = true;
    if (reset) this.page = 0;

    this.api.searchExternal(this.q.trim(), this.page).subscribe({
      next: (res) => {
        this.items = res.items;
        this.total = res.total;
        this.loading = false;
      },
      error: () => {
        this.error = 'Error buscando libros';
        this.loading = false;
      },
    });
  }

  next() {
    this.page += 1;
    this.search(false);
  }

  prev() {
    this.page = Math.max(0, this.page - 1);
    this.search(false);
  }

  mark(book: ExternalBook, status: 'WANT' | 'READ') {
    this.api
      .addToMyBooks({
        source: 'GOOGLE',
        externalId: book.externalId,
        title: book.title,
        authors: book.authors ?? [],
        thumbnail: book.thumbnail ?? null,
        categories: book.categories ?? [],
        status,
      })
      .subscribe({
        next: () => {
          book.userStatus = status;
        },
        error: () => {
          this.error = 'No se pudo guardar en tu lista';
        },
      });
  }
}
