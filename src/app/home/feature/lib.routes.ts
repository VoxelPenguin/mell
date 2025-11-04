import { Routes } from '@angular/router';
import { allCommunitiesResolver } from '../data-access/all-communities.resolver';

const homeRoutes: Routes = [
  {
    path: '',
    loadComponent: () => import('./home-page.component'),
    resolve: { allCommunities: allCommunitiesResolver },
  },
];

export default homeRoutes;
