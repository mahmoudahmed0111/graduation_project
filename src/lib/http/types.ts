/**
 * Phase 1 API envelopes (`phase1_api_docs.md`).
 */

export type ArchiveFilter = 'true' | 'false' | 'all';

/** Standard paginated list response (Option B). */
export interface Phase1ListMeta {
  status: string;
  results: number;
  currentPage: number;
  totalPages: number;
  totalResults: number;
}

export interface Phase1ListResult<T> extends Phase1ListMeta {
  items: T[];
}

/** Single-resource wrapper: `{ status, data: { college } }` etc. */
export interface Phase1SingleEnvelope<T extends Record<string, unknown>> {
  status: string;
  data: T;
}
