import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-my-books',
  standalone: true,
  imports: [NgIf, NgFor, NgClass],
  templateUrl: '../my-books/my-books.component.html',
})
export class MyBooksComponent implements OnInit {
  tab: 'WANT' | 'READ' = 'WANT';
  loading = true;
  items: any[] = [];

  constructor(private api: ApiService) {}

  ngOnInit() {
    this.load();
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
