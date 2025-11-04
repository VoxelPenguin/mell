import { Router, Routes } from '@angular/router';
import { NewCommunityFormService } from '../data-access/new-community-form.service';
import { communityResolver } from '../data-access/community.resolver';
import { inject } from '@angular/core';

const newCommunityRoutes: Routes = [
  {
    path: 'success/:communityId',
    loadComponent: () => import('./new-community-success-page.component'),
    resolve: { community: communityResolver },
  },
  {
    path: '',
    loadComponent: () => import('./new-community-page.component'),
    providers: [NewCommunityFormService],
    children: [
      {
        path: 'location',
        loadComponent: () => import('./new-community-location-page.component'),
      },
      {
        path: 'name',
        loadComponent: () => import('./new-community-name-page.component'),
      },
      {
        path: 'logo',
        loadComponent: () => import('./new-community-logo-page.component'),
        canActivate: [
          // if the name is invalid, redirect back to the name step
          () =>
            inject(NewCommunityFormService).form.name().invalid()
              ? inject(Router).parseUrl('/new-community/name')
              : true,
        ],
      },
      {
        path: '**',
        pathMatch: 'full',
        redirectTo: 'location',
      },
    ],
  },

  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'location',
  },
];

export default newCommunityRoutes;
