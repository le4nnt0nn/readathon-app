import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { NgIf } from '@angular/common';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterLink, RouterOutlet, NgIf],
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
