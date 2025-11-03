import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NewIssueFormModel } from '../../new-issue/feature/new-issue-page.component';
import {
  Issue,
  IssueStatus,
  IssueSubmission,
} from '../../../../types/db-types';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);

  submitNewIssue(formModel: NewIssueFormModel): Promise<Issue['id']> {
    const submission: IssueSubmission = {
      address: formModel.location.address,
      coordinates: [formModel.location.latitude, formModel.location.longitude],
      communityId: formModel.communityId,
      photoUrl: formModel.photoUrl,
      typeId: formModel.typeId,
      description: formModel.description,
      status: IssueStatus.Open,
      numUpvotes: 1,
      otherTypeName: '', // TODO: remove this?
    };

    return firstValueFrom(
      this.http.post<Issue['id']>(
        `${environment.harperApiUrl}/Issue/`,
        submission,
      ),
    );
  }
}
