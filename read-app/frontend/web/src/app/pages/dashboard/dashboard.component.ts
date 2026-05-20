import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIf, NgFor],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  loading = true;
  read = 0;
  want = 0;
  genres: { name: string; count: number }[] = [];
  topRated: any[] = [];

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.api.stats().subscribe({
      next: (stats) => {
        this.read = stats.read;
        this.want = stats.want;
      },
    });

    this.api.getInsights().subscribe({
      next: (data) => {
        this.genres = data.genres.slice(0, 5);
        this.topRated = data.topRated;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando insights', err);
        this.loading = false;
      },
    });
  }

    goToList(tab: 'READ' | 'WANT') {
      this.router.navigate(['/app/my-books'], {
        queryParams: { tab }
      });
  }
}
