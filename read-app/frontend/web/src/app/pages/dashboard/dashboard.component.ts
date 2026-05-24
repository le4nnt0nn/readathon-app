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
  tips = [
  "Entra en Buscar para descubrir libros del mundo y añadirlos a tu lista.",
  "Marca un libro como Leído para poder puntuarlo.",
  "Explora perfiles de amigos y descubre nuevas lecturas.",
  "Tu género más leído se actualiza automáticamente.",
  "Puedes buscar dentro de tus listas usando el buscador."
];
currentTipIndex = 0;
currentTip = this.tips[0];

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.api.stats().subscribe({
      next: (stats) => {
        this.read = stats.read;
        this.want = stats.want;
        this.startTipsRotation();
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

  startTipsRotation() {
    setInterval(() => {
      this.currentTipIndex =
        (this.currentTipIndex + 1) % this.tips.length;

      this.currentTip = this.tips[this.currentTipIndex];
    }, 20000);
}
}
