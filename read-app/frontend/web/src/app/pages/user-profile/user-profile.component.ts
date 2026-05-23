import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, UpperCasePipe } from '@angular/common';
import { ApiService } from '../../core/api.service';
import { AuthService } from '../../core/auth.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  standalone: true,
  imports: [NgIf, NgFor, UpperCasePipe],
  templateUrl: './user-profile.component.html',
})
export class UserProfileComponent implements OnInit {
  user: any;
  stats: any;
  recent: any[] = [];
  loading = true;
  canViewProfile = true;
  friendshipStatus: 'NONE' | 'PENDING' | 'ACCEPTED' = 'NONE';
  direction: 'OUTGOING' | 'INCOMING' | null = null;
  viewingOwnProfile = true;

  constructor(
    private api: ApiService,
    private auth: AuthService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const userId = params.get('userId');
      this.viewingOwnProfile = !userId;
      this.canViewProfile = true;
      this.loading = true;
      this.recent = [];

      if (!userId) {
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
        return;
      }

      this.api.userProfile(userId).subscribe({
        next: (res) => {
          this.user = res.user;
          this.stats = res.stats;
          this.canViewProfile = res.canViewProfile;
          this.friendshipStatus = res.friendshipStatus;
          this.direction = res.direction;
          this.loading = false;

          if (res.canViewProfile) {
            this.api.userBooks(userId, 'READ').subscribe((books) => {
              this.recent = books.items.slice(0, 3);
            });
          }
        },
        error: () => (this.loading = false),
      });
    });
  }

  requestFollow() {
    if (!this.user?.id) return;

    this.api.requestFriend(this.user.id).subscribe({
      next: (res) => {
        this.friendshipStatus = res.item.status;
        this.direction = res.item.recipientId === this.user.id ? 'OUTGOING' : 'INCOMING';
      },
    });
  }
}
