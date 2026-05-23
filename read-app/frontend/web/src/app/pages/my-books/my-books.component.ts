import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

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

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      if (params['tab'] === 'READ' || params['tab'] === 'WANT') {
        this.tab = params['tab'];
      }
      this.load();
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

  get filteredItems() {
    if (!this.searchTerm) return this.items;

    const term = this.searchTerm.toLowerCase();

    return this.items.filter(
      (b) =>
        b.title.toLowerCase().includes(term) ||
        b.authors?.join(' ').toLowerCase().includes(term) ||
        b.categories?.join(' ').toLowerCase().includes(term),
    );
  }

  setTab(t: 'WANT' | 'READ') {
    this.tab = t;
    this.load();
  }

  remove(book: any) {
    this.api.removeBook(book._id).subscribe({
      next: () => {
        this.items = this.items.filter((b) => b._id !== book._id);
      },
      error: () => console.error('Error eliminando libro'),
    });
  }
  
  rate(book: any, rating: number) {
    this.api.rateBook(book._id, rating).subscribe({
      next: (res) => {
        book.rating = res.item.rating;
      },
      error: () => {
        console.error('Error puntuando libro');
      },
    });
  }
}
