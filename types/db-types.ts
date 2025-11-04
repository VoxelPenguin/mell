// Enums
export enum IssueStatus {
  Open = 'Open',
  UnderReview = 'UnderReview',
  Scheduled = 'Scheduled',
  InProgress = 'InProgress',
  Completed = 'Completed',
  NotPlanned = 'NotPlanned',
}

// Core Interfaces
export interface Issue {
  id: string;
  photoUrl: string;
  typeId?: string;
  type?: IssueType;
  description: string;
  coordinates: [number, number]; // [longitude, latitude]
  address: string; // [longitude, latitude]
  communityId: string;
  community?: Community;
  status: IssueStatus;
  submittedByEmail?: string;
  numUpvotes: number;
  createdAt: string;
  updatedAt: string;
}

export interface IssueType {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Community {
  id: string;
  name: string;
  logoUrl: string;
  geographicCenter: [number, number]; // [longitude, latitude]
  radiusMeters: number;
  issues: Issue[];
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  userId: string;
  user: User;
  token: string;
  createdAt: string;
  updatedAt: string;
}

// Utility Types - for partial updates or creation
export type IssueSubmission = Required<
  Pick<
    Issue,
    | 'address'
    | 'coordinates'
    | 'communityId'
    | 'photoUrl'
    | 'typeId'
    | 'description'
    | 'status'
    | 'numUpvotes'
  >
>;
export type CommunitySubmission = Pick<
  Community,
  'geographicCenter' | 'radiusMeters' | 'name' | 'logoUrl'
>;
