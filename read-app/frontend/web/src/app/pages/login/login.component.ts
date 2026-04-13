import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  identifier = '';
  password = '';
  error: string | null = null;

  constructor(private auth: AuthService, private router: Router) {}

  submit() {
    this.error = null;
    this.auth.login({ identifier: this.identifier, password: this.password }).subscribe({
      next: () => this.router.navigateByUrl('/app/dashboard'),
      error: (e) => (this.error = e?.error?.message ?? 'Error al loguear'),
    });
  }
}
