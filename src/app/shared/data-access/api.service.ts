import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { NewIssueFormModel } from '../../new-issue/feature/new-issue-page.component';
import {
  Community,
  CommunitySubmission,
  Issue,
  IssueStatus,
  IssueSubmission,
} from '../../../../types/db-types';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';
import {
  getMimeType,
  getRawImageData,
} from '../../../../helpers/image-helpers';
import { PhotoAnalysisPayload } from '../../../../types/api-types';
import { NewCommunityFormModel } from '../../new-community/feature/new-community-page.component';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);

  getAiGeneratedIssueTypeAndDescriptionFromPhoto(
    photoUrl: NewIssueFormModel['photoUrl'],
  ): Promise<Pick<Required<Issue>, 'typeId' | 'description'>> {
    const payload: PhotoAnalysisPayload = {
      imageData: getRawImageData(photoUrl),
      imageMimeType: getMimeType(photoUrl),
    };

    return firstValueFrom(
      this.http.post<Pick<Required<Issue>, 'typeId' | 'description'>>(
        `${environment.harperApiUrl}/PhotoAnalysis`,
        payload,
      ),
    );
  }

  submitNewIssue(formValue: NewIssueFormModel): Promise<Issue['id']> {
    const submission: IssueSubmission = {
      address: formValue.location.address,
      coordinates: [formValue.location.latitude, formValue.location.longitude],
      communityId: formValue.communityId,
      photoUrl: formValue.photoUrl,
      typeId: formValue.typeId,
      description: formValue.description,
      status: IssueStatus.Open,
      numUpvotes: 1,
    };

    return firstValueFrom(
      this.http.post<Issue['id']>(
        `${environment.harperApiUrl}/Issue/`,
        submission,
      ),
    );
  }

  createNewCommunity(
    formValue: NewCommunityFormModel,
  ): Promise<Community['id']> {
    const submission: CommunitySubmission = {
      geographicCenter: [
        formValue.location.latitude,
        formValue.location.longitude,
      ],
      radiusMeters: formValue.location.radiusMeters,
      name: formValue.name,
      logoUrl: formValue.logoUrl,
    };

    return firstValueFrom(
      this.http.post<Community['id']>(
        `${environment.harperApiUrl}/Community/`,
        submission,
      ),
    );
  }
}
