import { Routes } from '@angular/router';

const newIssueRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./new-issue-page.component'),
  },
  {
    path: 'submitted',
    loadComponent: () => import('./submitted-page.component'),
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: '',
  },
];

export default newIssueRoutes;
