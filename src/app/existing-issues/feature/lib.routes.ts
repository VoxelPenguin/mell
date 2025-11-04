import { Routes } from '@angular/router';
import { issueResolver } from '../data-access/issue.resolver';

const existingIssuesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./existing-issues-page.component'),
    resolve: { issues: issueResolver },
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: '',
  },
];

export default existingIssuesRoutes;
