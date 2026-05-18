import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterOutlet, NgIf],
  templateUrl: './shell.component.html',
})
export class ShellComponent {
  securityOpen = false;
  constructor(public auth: AuthService, private router: Router) {}
  
  toggleSecurity() {
    this.securityOpen = !this.securityOpen;
  }

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
