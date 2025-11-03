import { Routes } from '@angular/router';

const newCommunityRoutes: Routes = [
  // {
  //   path: '',
  //   loadComponent: () => import('./new-community-page.component'),
  //   children: [
  //     {
  //       path: 'location',
  //       loadComponent: () => import('./new-community-location-page.component'),
  //     },
  //     {
  //       path: 'name',
  //       loadComponent: () => import('./new-community-name-page.component'),
  //     },
  //     {
  //       path: 'logo',
  //       loadComponent: () => import('./new-community-logo-page.component'),
  //     },
  //     {
  //       path: 'success',
  //       loadComponent: () => import('./new-community-sucess-page.component'),
  //     },
  //   ],
  // },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: '',
  },
];

export default newCommunityRoutes;
