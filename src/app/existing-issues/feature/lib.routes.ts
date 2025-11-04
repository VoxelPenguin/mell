import { Routes } from '@angular/router';
import { pendingIssueResolver } from '../data-access/pending-issue.resolver';

const existingIssuesRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./existing-issues-page.component'),
    resolve: { issues: pendingIssueResolver },
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: '',
  },
];

export default existingIssuesRoutes;
