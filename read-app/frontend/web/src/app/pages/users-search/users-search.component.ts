import { Component } from '@angular/core';
import { NgFor, NgIf, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService, UserSearchItem } from '../../core/api.service';

@Component({
  standalone: true,
  imports: [NgIf, NgFor, FormsModule, RouterLink, UpperCasePipe],
  templateUrl: './users-search.component.html',
})
export class UsersSearchComponent {
  q = '';
  loading = false;
  searched = false;
  items: UserSearchItem[] = [];

  constructor(private api: ApiService) { }

  search() {
    const term = this.q.trim();
    this.searched = true;

    if (!term) {
      this.items = [];
      return;
    }

    this.loading = true;
    this.api.searchUsers(term).subscribe({
      next: (res) => {
        this.items = res.items;
        this.loading = false;
      },
      error: () => (this.loading = false),
    });
  }

  request(user: UserSearchItem) {
    this.api.requestFriend(user.id).subscribe({
      next: (res) => {
        user.friendshipStatus = res.item.status;
        user.requestId = res.item._id;
        user.direction = res.item.recipientId === user.id ? 'OUTGOING' : 'INCOMING';
      },
    });
  }
}
