import { GoogleGenAI, Part, Type } from '@google/genai';
import { Resource } from 'harperdb';
import { RequestTarget } from '../node_modules/harperdb/resources/RequestTarget';
import { PhotoAnalysisPayload } from '../types/api-types';
import { IssueType } from '../types/db-types';

const PHOTO_ANALYSIS_PROMPT = `
  You are responsible for reviewing complaints submitted as images by concerned citizens.  Your job is to identify
  the problem in the image, determine which of the provided issue types best matches the image, and fill out a form
  that the citizen can use to submit their complaint.

  The form consists of the following fields:

  typeId: The ID of the issue type matching the provided image.  This should use the ID field of one of the
  provided issues types.

  description: A short description of the issue.  The description should be concise and professional, and it should
  not use any special formatting (e.g. markdown or HTML).

  These are the available issue types:
  {{issueTypes}}
`;

const { IssueType: IssueTypeTable } = tables;

export class PhotoAnalysis extends Resource {
  static override loadAsInstance = false; // enable the updated API
  private readonly ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  override async post(_target: RequestTarget, payload: PhotoAnalysisPayload) {
    const asyncIssueTypes: AsyncIterable<IssueType> = IssueTypeTable.search({
      conditions: [
        {
          attribute: 'communityId',
          comparator: 'equals',
          value: payload.communityId,
        },
      ],
    } as RequestTarget);

    const issueTypes = await Array.fromAsync(asyncIssueTypes);

    const contents: Part[] = [
      {
        text: PHOTO_ANALYSIS_PROMPT.replace(
          '{{issueTypes}}',
          JSON.stringify(issueTypes),
        ),
      },
      {
        inlineData: {
          mimeType: payload.imageMimeType,
          data: payload.imageData,
        },
      },
    ];

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: contents,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            typeId: {
              type: Type.STRING,
            },
            description: {
              type: Type.STRING,
            },
          },
        },
      },
    });

    if (!response.text) {
      throw new Error('Failed to parse AI response.');
    }

    return JSON.parse(response.text);
  }
}
