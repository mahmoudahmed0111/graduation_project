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
  // Phase 4
  materials?: unknown[];
  assessments?: unknown[];
  submissions?: unknown[];
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
 *
 * `resourceKey` may be a single key or an array of accepted keys (the first
 * present array wins). If none of the keys are present, the function falls
 * back to:
 *   1. the first array-valued field on `data` (covers backends that return
 *      a single array under an unexpected name);
 *   2. `data` itself when it is an array (covers backends that return the
 *      array directly under `data`).
 */
export function normalizeListResponse<T>(
  response: AxiosResponse<ListEnvelope>,
  resourceKey: keyof ListDataBag | Array<keyof ListDataBag | string>
): Phase1ListResult<T> {
  const body = response.data ?? {};
  const bag = body.data;
  const keys = Array.isArray(resourceKey) ? resourceKey : [resourceKey];

  let raw: unknown;

  if (bag) {
    for (const key of keys) {
      const candidate = (bag as Record<string, unknown>)[key as string];
      if (Array.isArray(candidate)) {
        raw = candidate;
        break;
      }
    }
    if (raw === undefined) {
      // Backend returned the array directly under `data` …
      if (Array.isArray(bag)) {
        raw = bag;
      } else {
        // … or under some unexpected name. Pick the first array-valued field.
        for (const value of Object.values(bag as Record<string, unknown>)) {
          if (Array.isArray(value)) {
            raw = value;
            break;
          }
        }
      }
    }
  }

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
 *
 * `resourceKey` may be a single key or an array of accepted keys (the first
 * present wins). If none of the keys are present but `data` itself looks like
 * an entity (has `_id` or `id`), it is returned as-is — this covers backends
 * that return the resource directly under `data` without nesting.
 */
export function normalizeSingleResponse<T>(
  response: AxiosResponse<{ status?: string; data?: Record<string, unknown> }>,
  resourceKey: string | string[]
): T {
  const bag = response.data?.data;
  const keys = Array.isArray(resourceKey) ? resourceKey : [resourceKey];

  if (bag) {
    for (const key of keys) {
      const entity = bag[key];
      if (entity !== undefined && entity !== null) return entity as T;
    }
    // Fallback: treat `data` itself as the entity if it has an id.
    if (typeof bag._id === 'string' || typeof bag.id === 'string') {
      return bag as T;
    }
  }

  throw new Error(`${keys[0]} not found`);
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
