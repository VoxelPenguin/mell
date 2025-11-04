import { Router, Routes } from '@angular/router';
import { communitiesWithinRangeResolver } from '../data-access/communities-within-range.resolver';
import { issueTypesResolver } from '../data-access/issue-types.resolver';
import { issueResolver } from '../data-access/issue.resolver';
import { NewIssueFormService } from '../data-access/new-issue-form.service';
import { inject } from '@angular/core';

const newIssueRoutes: Routes = [
  {
    path: 'success/:issueId',
    loadComponent: () => import('./new-issue-success-page.component'),
    resolve: { issue: issueResolver },
  },
  {
    path: '',
    loadComponent: () => import('./new-issue-page.component'),
    providers: [NewIssueFormService],
    children: [
      {
        path: 'location',
        loadComponent: () => import('./new-issue-location-page.component'),
      },
      {
        path: 'community',
        loadComponent: () => import('./new-issue-community-page.component'),
        resolve: { communities: communitiesWithinRangeResolver },
        canActivate: [
          // if the address is invalid, redirect back to the location step
          () =>
            inject(NewIssueFormService).form.location.address().invalid()
              ? inject(Router).parseUrl('/new-issue/location')
              : true,
        ],
      },
      {
        path: 'prompt-create-new-community',
        loadComponent: () =>
          import('./new-issue-prompt-create-new-community-page.component'),
      },
      {
        path: 'photo',
        loadComponent: () => import('./new-issue-photo-page.component'),
        canActivate: [
          // if the community is invalid, redirect back to the community step
          () =>
            inject(NewIssueFormService).form.communityId().invalid()
              ? inject(Router).parseUrl('/new-issue/community')
              : true,
        ],
      },
      {
        path: 'processing',
        loadComponent: () => import('./new-issue-processing-page.component'),
        canActivate: [
          // if the photoUrl is invalid, redirect back to the photo step
          () =>
            inject(NewIssueFormService).form.photoUrl().invalid()
              ? inject(Router).parseUrl('/new-issue/photo')
              : true,
        ],
      },
      {
        path: 'review',
        loadComponent: () => import('./new-issue-review-page.component'),
        resolve: { issueTypes: issueTypesResolver },
        canActivate: [
          // if there is no typeId, redirect back to the processing step
          () =>
            inject(NewIssueFormService).formValue().typeId
              ? true
              : inject(Router).parseUrl('/new-issue/processing'),
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

export default newIssueRoutes;
