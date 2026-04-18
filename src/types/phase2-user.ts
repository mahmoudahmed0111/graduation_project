import type { UserRole } from '@/types';

export type Phase2BulkAction = 'deactivate' | 'activate' | 'move-department' | 'graduate';

export interface Phase2NestedRef {
  _id: string;
  name?: string;
  code?: string;
}

/** Raw `user` object from Phase 2 Users API */
export interface Phase2ApiUser {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  role: UserRole | string;
  photo?: string | null;
  nationalID?: string;
  realNationalID?: string;
  college_id?: Phase2NestedRef | string;
  department_id?: Phase2NestedRef | string;
  academicStatus?: string;
  level?: number;
  gpa?: number;
  earnedCredits?: number;
  rfidTag?: string | null;
  active?: boolean;
  createdAt?: string;
  requiresPasswordChange?: boolean;
  credentialEmailSent?: boolean;
}

export interface BulkImportUsersResult {
  created: number;
  failed: number;
  logId?: string;
}

export interface BulkActionsDeactivateResult {
  action: string;
  requested: number;
  modified: number;
  matched: number;
  notModified: number;
  notFound: number;
}

export interface BulkActionsGraduateResult {
  action: string;
  requested: number;
  modified: number;
  alreadyGraduated: number;
  skippedNonStudents: number;
  notFound: number;
}

export type BulkActionsResult = BulkActionsDeactivateResult | BulkActionsGraduateResult;
