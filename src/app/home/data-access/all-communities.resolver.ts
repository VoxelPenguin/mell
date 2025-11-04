import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Community } from '../../../../types/db-types';

export const allCommunitiesResolver: ResolveFn<Community[]> = () => {
  const http = inject(HttpClient);

  return http.get<Community[]>(
    `${environment.harperApiUrl}/Community?sort(+name)`,
  );
};
