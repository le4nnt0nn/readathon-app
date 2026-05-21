import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';

import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { ShellComponent } from './layout/shell/shell.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { DiscoverComponent } from './pages/discover/discover.component';
import { MyBooksComponent } from './pages/my-books/my-books.component';
import { UserProfileComponent } from './pages/user-profile/user-profile.component';
import { BookDetailComponent } from './pages/book-detail/book-detail.component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },

  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },

  {
    path: 'app',
    canMatch: [authGuard],
    component: ShellComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'discover', component: DiscoverComponent },
      { path: 'my-books', component: MyBooksComponent },
      { path: 'users/:userId', component: UserProfileComponent },
      { path: 'books/:source/:externalId', component: BookDetailComponent },
      {
        path: 'change-password',
        loadComponent: () =>
          import('./pages/change-password/change-password.component').then(
            (m) => m.ChangePasswordComponent,
          ),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./pages/user-profile/user-profile.component').then(
            (m) => m.UserProfileComponent,
          ),
      },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
