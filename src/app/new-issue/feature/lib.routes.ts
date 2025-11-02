import { Routes } from '@angular/router';
import { multipleCommunitiesResolver } from '../data-access/multiple-communities.resolver';

const newIssueRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./new-issue-page.component'),
    children: [
      {
        path: 'location',
        loadComponent: () => import('./location-page.component'),
      },
      {
        path: 'choose-community',
        loadComponent: () => import('./choose-community-page.component'),
        resolve: { communities: multipleCommunitiesResolver },
      },
      {
        path: 'photo',
        loadComponent: () => import('./photo-page.component'),
      },
    ],
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
