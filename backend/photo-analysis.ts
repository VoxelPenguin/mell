import { tables, Resource } from 'harperdb';
import { Community, IssueType } from '../types/db-types';
// @ts-expect-error: :'-(
import { RequestTarget } from 'harperdb/resources/RequestTarget';

const { IssueType: IssueTypeTable } = tables;

export interface PhotoAnalysisPayload {
  communityId: Community['id'];
  photoDataUrl: string;
  address: string;
}

export class PhotoAnalysis extends Resource {
  static loadAsInstance = false; // enable the updated API

  async post(target: unknown, payload: PhotoAnalysisPayload) {
    const issueTypes: IssueType[] = IssueTypeTable.search({
      conditions: [
        {
          attribute: 'communityId',
          comparator: 'equals',
          value: payload.communityId,
        },
      ],
    } as RequestTarget);

    return issueTypes;
  }
}
