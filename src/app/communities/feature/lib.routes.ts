import { Routes } from '@angular/router';
import { communitiesContainingTextResolver } from '../data-access/communities-containing-text.resolver';
import { communityResolver } from '../data-access/community.resolver';
import { issuesByCommunityResolver } from '../data-access/issues-by-community.resolver';

const communitiesRoutes: Routes = [
  {
    path: 'search/:searchString',
    loadComponent: () => import('./communities-search-page.component'),
    resolve: { communities: communitiesContainingTextResolver },
  },
  {
    path: 'dashboard/:communityId',
    loadComponent: () => import('./community-dashboard-page.component'),
    resolve: {
      issues: issuesByCommunityResolver,
      community: communityResolver,
    },
    data: { preferDesktop: true },
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'search/',
  },
];

export default communitiesRoutes;
