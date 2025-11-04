import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Issue } from '../../../../types/db-types';
import { environment } from '../../../environments/environment';

export const issuesByCommunityResolver: ResolveFn<Issue[]> = (route) => {
  const http = inject(HttpClient);
  const communityId = route.params['communityId'] as string | undefined;

  if (!communityId) {
    throw new Error('Missing community ID');
  }

  return http.get<Issue[]>(
    `${environment.harperApiUrl}/Issue?communityId=${communityId}&select(*,type)`,
  );
};
