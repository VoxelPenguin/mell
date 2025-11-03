import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Community } from '../../../../types/db-types';
import { NewIssueFormService } from './new-issue-form.service';

export const communitiesWithinRangeResolver: ResolveFn<Community[]> = () => {
  const http = inject(HttpClient);
  const newIssueFormService = inject(NewIssueFormService);

  const {
    location: { latitude, longitude },
  } = newIssueFormService.formValue();

  return http.get<Community[]>(
    `${environment.harperApiUrl}/Location?latitude=${latitude}&longitude=${longitude}`,
  );
};
