import { Routes } from '@angular/router';

const existingIssuesRoutes: Routes = [
  // {
  //   path: 'map',
  //   loadComponent: () => import('./existing-issues-map-page.component'),
  // },
  // {
  //   path: 'issue/:issueId',
  //   loadComponent: () => import('./existing-issues-issue-page.component'),
  // },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'map',
  },
];

export default existingIssuesRoutes;
