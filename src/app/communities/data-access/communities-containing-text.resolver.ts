import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Community } from '../../../../types/db-types';
import { environment } from '../../../environments/environment';

export const communitiesContainingTextResolver: ResolveFn<Community[]> = (
  route,
) => {
  const http = inject(HttpClient);
  const searchString = route.params['searchString'] ?? '';

  return http.get<Community[]>(
    `${environment.harperApiUrl}/Community?sort(+name)&name=ct=${searchString}`,
  );
};
