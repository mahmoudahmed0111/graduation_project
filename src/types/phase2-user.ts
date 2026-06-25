import type { UserRole } from '@/types';

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

