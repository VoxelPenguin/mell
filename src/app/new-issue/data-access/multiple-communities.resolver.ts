import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { environment } from '../../../environments/environment';

export const multipleCommunitiesResolver: ResolveFn<object> = () => {
  const http = inject(HttpClient);

  return http.get(`${environment.harperApiUrl}/Community?sort(+name)`);
};
