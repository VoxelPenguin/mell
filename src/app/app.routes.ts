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
    path: '**',
    pathMatch: 'full',
    redirectTo: 'home',
  },
];
