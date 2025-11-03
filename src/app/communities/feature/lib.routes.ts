import { Routes } from '@angular/router';

const communitiesRoutes: Routes = [
  // {
  //   path: '',
  //   loadComponent: () => import('./communities-list-page.component'),
  // },
  // {
  //   path: ':communityId',
  //   loadComponent: () => import('./communities-community-page.component'),
  // },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: '',
  },
];

export default communitiesRoutes;
