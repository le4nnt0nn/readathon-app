import { Component } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { NgIf } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, RouterOutlet, NgIf],
  templateUrl: './shell.component.html',
  animations: [
    trigger('dropdownAnimation', [
      transition(':enter', [
        style({
          opacity: 0,
          transform: 'translateY(-10px) scale(0.95)'
        }),
        animate('180ms cubic-bezier(.16,.8,.24,1)',
          style({
            opacity: 1,
            transform: 'translateY(0) scale(1)'
          })
        )
      ]),
      transition(':leave', [
        animate('140ms ease-in',
          style({
            opacity: 0,
            transform: 'translateY(-8px) scale(0.96)'
          })
        )
      ])
    ])
  ]
})
export class ShellComponent {
  menuOpen = false;
  securityOpen = false;
  usersOpen = false;
  constructor(public auth: AuthService, private router: Router) {}

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
    this.securityOpen = false;
    this.usersOpen = false;
  }

  closeMenus() {
    this.menuOpen = false;
    this.securityOpen = false;
    this.usersOpen = false;
  }

  toggleUsers() {
    this.usersOpen = !this.usersOpen;
    this.securityOpen = false;
  }
  
  toggleSecurity() {
    this.securityOpen = !this.securityOpen;
    this.usersOpen = false;
  }

  logout() {
    this.closeMenus();
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}
