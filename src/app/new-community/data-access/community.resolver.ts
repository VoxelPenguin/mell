import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Community } from '../../../../types/db-types';
import { map } from 'rxjs';

export const communityResolver: ResolveFn<Community> = (route) => {
  const http = inject(HttpClient);

  const communityId: string = route.params['communityId'];

  return http
    .get<Community[]>(`${environment.harperApiUrl}/Community?id=${communityId}`)
    .pipe(map((array) => array[0]));
};
