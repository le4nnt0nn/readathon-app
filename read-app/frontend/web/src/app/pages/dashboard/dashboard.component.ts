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
    'Explora la sección Buscar para descubrir libros de todo el mundo y añadirlos fácilmente a tu biblioteca personal. Cada nuevo título puede convertirse en tu próxima gran lectura.',
    'Cuando marques un libro como Leído, podrás puntuarlo y dejar tu propia valoración. Con el tiempo, tu perfil reflejará tu estilo y preferencias lectoras.',
    'Tu dashboard evoluciona contigo. A medida que leas más, verás cómo cambian tus géneros más leídos y tus libros mejor valorados.',
    'No olvides explorar perfiles de otros lectores. Descubrir qué están leyendo tus amigos puede abrirte la puerta a nuevas historias inesperadas.',
    'Organiza tu experiencia lectora manteniendo actualizadas tus listas de Quiero leer y Leídos. Una biblioteca ordenada hace que siempre encuentres lo que buscas.',
  ];
  currentTipIndex = 0;
  currentTip = this.tips[0];

  constructor(
    private api: ApiService,
    private router: Router,
  ) {}

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
      queryParams: { tab },
    });
  }

  tipVisible = true;

  startTipsRotation() {
    setInterval(() => {
      this.tipVisible = false;

      setTimeout(() => {
        this.currentTipIndex = (this.currentTipIndex + 1) % this.tips.length;
        this.currentTip = this.tips[this.currentTipIndex];
        this.tipVisible = true;
      }, 300);
    }, 10000);
  }
}
