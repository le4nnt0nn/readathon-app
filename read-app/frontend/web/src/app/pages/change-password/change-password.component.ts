import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../core/api.service';

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.component.html'
})
export class ChangePasswordComponent {

  currentPassword = '';
  newPassword = '';
  confirmPassword = '';

  message = '';
  error = '';
  loading = false;

  constructor(
    private api: ApiService,
    private router: Router
  ) {}

  submit() {
    this.message = '';
    this.error = '';

    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Las contraseñas no coinciden';
      return;
    }

    this.loading = true;

    this.api.changePassword(this.currentPassword, this.newPassword)
      .subscribe({
        next: () => {
          this.loading = false;
          this.message = 'Contraseña actualizada 🌊';

          setTimeout(() => {
            localStorage.removeItem('bookocean_token');
            this.router.navigateByUrl('/login');
          }, 1500);
        },
        error: (err) => {
          this.loading = false;
          this.error = err.error?.message || 'Error al cambiar contraseña';
        }
      });
  }
}