import type { AxiosResponse } from 'axios';
import type { Phase1ListMeta, Phase1ListResult } from './types';

/** Backend `data` bag for list endpoints. */
type ListDataBag = {
  colleges?: unknown[];
  departments?: unknown[];
  locations?: unknown[];
  users?: unknown[];
  courseCatalogs?: unknown[];
  courseOfferings?: unknown[];
  enrollments?: unknown[];
  [key: string]: unknown;
};

type ListEnvelope = {
  status?: string;
  results?: number;
  currentPage?: number;
  totalPages?: number;
  totalResults?: number;
  data?: ListDataBag;
};

/**
 * Normalize a Phase 1 list response into `{ items, ...meta }`.
 */
export function normalizeListResponse<T>(
  response: AxiosResponse<ListEnvelope>,
  resourceKey: keyof ListDataBag
): Phase1ListResult<T> {
  const body = response.data ?? {};
  const raw = body.data?.[resourceKey];
  const items = Array.isArray(raw) ? (raw as T[]) : [];
  return {
    status: body.status ?? 'success',
    results: body.results ?? items.length,
    currentPage: body.currentPage ?? 1,
    totalPages: body.totalPages ?? 1,
    totalResults: body.totalResults ?? items.length,
    items,
  };
}

/**
 * Normalize single-resource `{ status, data: { college|department|... } }`.
 */
export function normalizeSingleResponse<T>(
  response: AxiosResponse<{ status?: string; data?: Record<string, unknown> }>,
  resourceKey: string
): T {
  const bag = response.data?.data;
  const entity = bag?.[resourceKey];
  if (entity === undefined || entity === null) {
    throw new Error(`${resourceKey} not found`);
  }
  return entity as T;
}

export function mergeListMeta(
  partial: Partial<Pick<Phase1ListMeta, 'results' | 'currentPage' | 'totalPages' | 'totalResults'>>
): Pick<Phase1ListMeta, 'results' | 'currentPage' | 'totalPages' | 'totalResults'> {
  return {
    results: partial.results ?? 0,
    currentPage: partial.currentPage ?? 1,
    totalPages: partial.totalPages ?? 1,
    totalResults: partial.totalResults ?? 0,
  };
}
