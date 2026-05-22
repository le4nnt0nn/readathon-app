import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, UpperCasePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ApiService, UserSearchItem } from '../../core/api.service';

@Component({
  standalone: true,
  imports: [NgIf, NgFor, RouterLink, UpperCasePipe],
  templateUrl: './friends.component.html',
})
export class FriendsComponent implements OnInit {
  friends: UserSearchItem[] = [];
  incoming: UserSearchItem[] = [];
  outgoing: UserSearchItem[] = [];
  loading = true;

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;

    this.api.friends().subscribe({
      next: (res) => {
        this.friends = res.items;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });

    this.api.friendRequests().subscribe({
      next: (res) => {
        this.incoming = res.incoming;
        this.outgoing = res.outgoing;
      },
    });
  }

  accept(request: UserSearchItem) {
    if (!request.requestId) return;

    this.api.acceptFriendRequest(request.requestId).subscribe({
      next: () => this.load(),
    });
  }

  reject(request: UserSearchItem) {
    if (!request.requestId) return;

    this.api.deleteFriendRequest(request.requestId).subscribe({
      next: () => this.load(),
    });
  }
}
