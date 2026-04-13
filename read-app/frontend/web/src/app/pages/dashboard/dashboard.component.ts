import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgIf],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  loading = true;
  read = 0;
  want = 0;

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.api.stats().subscribe({
      next: (stats) => {
        this.read = stats.read;
        this.want = stats.want;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando estadísticas:', err);
        this.loading = false;
      },
    });
  }
}