/**
 * Phase 6 — Scoped Announcements & Real-Time Notifications (frontend contracts).
 * Mirrors `phase6_api_doc.md`. REST (Module 14) + Socket.io payloads (Module 15).
 */

export type ScopeLevel = 'Global' | 'College' | 'Department' | 'Course';

export interface AnnouncementAuthor {
  _id?: string;
  name: string;
  role: string;
}

export interface AnnouncementScope {
  level: ScopeLevel;
  target: string[];
}

/** REST shape — `author` is populated `{ _id, name, role }`. */
export interface Announcement {
  _id: string;
  title: string;
  content: string;
  author: AnnouncementAuthor;
  scope: AnnouncementScope;
  isArchived: boolean;
  expiresAt: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateAnnouncementBody {
  title: string;
  content: string;
  scope: { level: ScopeLevel; target: string[] };
  expiresAt?: string;
}

/** Socket.io `new_announcement` payload — `id` (not `_id`), author has no `_id`. */
export interface LiveAnnouncement {
  id: string;
  title: string;
  content: string;
  scope: AnnouncementScope;
  createdAt: string;
  author: { name: string; role: string };
}

export interface SubscriptionError {
  message: string;
}

/** A notification item surfaced in the bell / notifications page (from socket). */
export interface LiveNotification {
  id: string;
  title: string;
  content: string;
  scopeLevel: ScopeLevel;
  authorName: string;
  authorRole: string;
  createdAt: string;
  read: boolean;
}
