import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/feature/lib.routes'),
  },
  {
    path: 'new-issue',
    loadChildren: () => import('./new-issue/feature/lib.routes'),
  },
  {
    path: 'existing-issues',
    loadChildren: () => import('./existing-issues/feature/lib.routes'),
  },
  {
    path: 'new-community',
    loadChildren: () => import('./new-community/feature/lib.routes'),
  },
  {
    path: 'communities',
    loadChildren: () => import('./communities/feature/lib.routes'),
    data: { preferDesktop: true },
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'home',
  },
];
