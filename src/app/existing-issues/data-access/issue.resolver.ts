import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Issue } from '../../../../types/db-types';
import { environment } from '../../../environments/environment';

export const issueResolver: ResolveFn<Issue[]> = (route) => {
  const http = inject(HttpClient);

  return http.get<Issue[]>(
    `${environment.harperApiUrl}/Issue?select(*,type,community)&status!=Completed`,
  );
};
