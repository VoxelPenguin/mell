import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { environment } from '../../../environments/environment';
import { IssueType } from '../../../../types/db-types';

export const issueTypesResolver: ResolveFn<IssueType[]> = () => {
  const http = inject(HttpClient);

  return http.get<IssueType[]>(
    `${environment.harperApiUrl}/IssueType?sort(+name)`,
  );
};
