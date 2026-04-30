import { apiClient } from '@/lib/http/client';
import { normalizeListResponse, normalizeSingleResponse } from '@/lib/http/normalize';
import type { Phase1ListResult } from '@/lib/http/types';
import type { IPhase4Material, Phase4MaterialCategory } from '@/types';

export interface MaterialListParams {
  category?: Phase4MaterialCategory;
}

export interface MaterialCreateInput {
  title: string;
  description?: string;
  category: Phase4MaterialCategory;
  isExternalLink: boolean;
  url?: string;
  file?: File;
}

export type MaterialUpdateInput = Partial<MaterialCreateInput>;

function buildMaterialFormData(input: MaterialCreateInput | MaterialUpdateInput): FormData {
  const fd = new FormData();
  if (input.title !== undefined) fd.append('title', input.title);
  if (input.description !== undefined) fd.append('description', input.description);
  if (input.category !== undefined) fd.append('category', input.category);
  if (input.isExternalLink !== undefined) fd.append('isExternalLink', String(input.isExternalLink));
  if (input.url !== undefined && input.url !== '') fd.append('url', input.url);
  if (input.file) fd.append('file', input.file);
  return fd;
}

export async function listMaterials(
  offeringId: string,
  params?: MaterialListParams
): Promise<Phase1ListResult<IPhase4Material>> {
  const response = await apiClient.get(
    `/course-offerings/${encodeURIComponent(offeringId)}/materials`,
    { params }
  );
  return normalizeListResponse<IPhase4Material>(response, 'materials');
}

export async function getMaterial(
  offeringId: string,
  materialId: string
): Promise<IPhase4Material> {
  const response = await apiClient.get(
    `/course-offerings/${encodeURIComponent(offeringId)}/materials/${encodeURIComponent(materialId)}`
  );
  return normalizeSingleResponse<IPhase4Material>(response, 'material');
}

export async function createMaterial(
  offeringId: string,
  input: MaterialCreateInput
): Promise<IPhase4Material> {
  const fd = buildMaterialFormData(input);
  const response = await apiClient.post(
    `/course-offerings/${encodeURIComponent(offeringId)}/materials`,
    fd,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return normalizeSingleResponse<IPhase4Material>(response, 'material');
}

export async function updateMaterial(
  offeringId: string,
  materialId: string,
  input: MaterialUpdateInput
): Promise<IPhase4Material> {
  const fd = buildMaterialFormData(input);
  const response = await apiClient.patch(
    `/course-offerings/${encodeURIComponent(offeringId)}/materials/${encodeURIComponent(materialId)}`,
    fd,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );
  return normalizeSingleResponse<IPhase4Material>(response, 'material');
}

export async function deleteMaterial(offeringId: string, materialId: string): Promise<void> {
  await apiClient.delete(
    `/course-offerings/${encodeURIComponent(offeringId)}/materials/${encodeURIComponent(materialId)}`
  );
}
