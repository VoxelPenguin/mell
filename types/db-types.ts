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
  otherTypeName?: string;
  description: string;
  coordinates: [number, number]; // [longitude, latitude]
  address: string; // [longitude, latitude]
  communityId: string;
  community: Community;
  status: IssueStatus;
  submittedByEmail?: string;
  numUpvotes: number;
  createdAt: string;
  updatedAt: string;
}

export interface IssueType {
  id: string;
  communityId: string;
  community: Community;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface Community {
  id: string;
  name: string;
  logoUrl?: string;
  geographicCenter: [number, number]; // [longitude, latitude]
  radiusMeters: number;
  issueTypes: IssueType[];
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
export type IssueInput = Omit<
  Issue,
  'id' | 'type' | 'community' | 'createdAt' | 'updatedAt'
>;
export type IssueSubmission = Required<
  Omit<
    Issue,
    'id' | 'type' | 'community' | 'submittedByEmail' | 'createdAt' | 'updatedAt'
  >
>;
export type IssueTypeInput = Omit<
  IssueType,
  'id' | 'community' | 'createdAt' | 'updatedAt'
>;
export type CommunityInput = Omit<
  Community,
  'id' | 'issueTypes' | 'issues' | 'createdAt' | 'updatedAt'
>;
export type UserInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
export type SessionInput = Omit<
  Session,
  'id' | 'user' | 'createdAt' | 'updatedAt'
>;

// Utility type for responses without sensitive data
export type SafeUser = Omit<User, 'password'>;
