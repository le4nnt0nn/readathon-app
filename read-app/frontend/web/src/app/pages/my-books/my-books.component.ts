import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-my-books',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, FormsModule],
  templateUrl: '../my-books/my-books.component.html',
})
export class MyBooksComponent implements OnInit {
  tab: 'WANT' | 'READ' = 'WANT';
  loading = true;
  items: any[] = [];
  searchTerm = '';

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.load();
  }

    get filteredItems() {
    if (!this.searchTerm) return this.items;

    const term = this.searchTerm.toLowerCase();

    return this.items.filter(b =>
      b.title.toLowerCase().includes(term) ||
      (b.authors?.join(' ').toLowerCase().includes(term)) ||
      (b.categories?.join(' ').toLowerCase().includes(term))
    );
  }

  setTab(t: 'WANT' | 'READ') {
    this.tab = t;
    this.load();
  }

  rate(book: any, rating: number) {
    this.api.rateBook(book._id, rating).subscribe({
      next: (res) => {
        book.rating = res.item.rating;
      },
      error: () => {
        console.error("Error puntuando libro");
      }
    });
  }

  load() {
    this.loading = true;
    this.api.myBooks(this.tab).subscribe({
      next: (res) => {
        this.items = res.items;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }
}
