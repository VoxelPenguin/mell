import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Issue } from '../../../../types/db-types';
import { map } from 'rxjs';

export const issueResolver: ResolveFn<Issue> = (route) => {
  const http = inject(HttpClient);

  const issueId: string = route.params['issueId'];

  return http
    .get<
      Issue[]
    >(`${environment.harperApiUrl}/Issue?id=${issueId}&select(photoUrl,address,description,status,community{name,logoUrl},type{name})`)
    .pipe(map((array) => array[0]));
};
