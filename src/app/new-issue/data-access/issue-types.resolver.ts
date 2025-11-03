import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { environment } from '../../../environments/environment';
import { IssueType } from '../../../../types/db-types';
import { NewIssueFormService } from './new-issue-form.service';

export const issueTypesResolver: ResolveFn<IssueType[]> = () => {
  const http = inject(HttpClient);
  const newIssueFormService = inject(NewIssueFormService);

  const communityId = newIssueFormService.formValue().communityId;

  return http.get<IssueType[]>(
    `${environment.harperApiUrl}/IssueType?communityId=${communityId}&sort(+name)`,
  );
};
