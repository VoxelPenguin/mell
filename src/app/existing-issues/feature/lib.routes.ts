import { Routes } from '@angular/router';

const existingIssuesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./existing-issues-page.component'),
  },
];

export default existingIssuesRoutes;
