import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, UpperCasePipe  } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  imports: [NgIf, NgFor, UpperCasePipe ],
  templateUrl: './user-profile.component.html',
})
export class UserProfileComponent implements OnInit {
  user: any;
  stats: any;
  recent: any[] = [];
  loading = true;

  constructor(
    private api: ApiService,
    private auth: AuthService,
  ) {}

  ngOnInit() {
    this.auth.user$.subscribe((user) => {
      this.user = user;
    });

    this.api.stats().subscribe((data) => {
      this.stats = data;
      this.loading = false;
    });

    this.api.myBooks('READ').subscribe((res) => {
      this.recent = res.items.slice(0, 3);
    });
  }
}
