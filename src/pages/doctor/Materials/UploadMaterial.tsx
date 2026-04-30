import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, FileText, X, Link as LinkIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToastStore } from '@/store/toastStore';
import { useCreateMaterial } from '@/hooks/queries/usePhase4Materials';
import { useMyTeachingOfferings } from '@/hooks/queries/useMyOfferings';
import { getApiErrorMessage } from '@/lib/http/client';
import type { Phase4MaterialCategory } from '@/types';

const ACCEPTED_MIME = [
  'application/pdf',
  'video/mp4',
  'image/png',
  'image/jpeg',
  'application/msword',
];
const MAX_FILE_BYTES = 50 * 1024 * 1024;

const fileCategories = ['Lectures', 'Sheets', 'Readings'] as const;

const schema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    category: z.enum(['Lectures', 'Sheets', 'Readings', 'Links']),
    isExternalLink: z.boolean(),
    url: z.string().optional(),
  })
  .refine(
    (v) => !v.isExternalLink || (v.url && v.url.trim().length > 0),
    { path: ['url'], message: 'URL is required for external links.' }
  )
  .refine(
    (v) => !v.isExternalLink || v.category === 'Links',
    { path: ['category'], message: "Category must be 'Links' for external materials." }
  )
  .refine(
    (v) => v.isExternalLink || v.category !== 'Links',
    { path: ['category'], message: "Category must be 'Lectures', 'Sheets', or 'Readings' for files." }
  );

type FormValues = z.infer<typeof schema>;

export function UploadMaterial() {
  const navigate = useNavigate();
  const params = useParams<{ offeringId?: string }>();
  const [searchParams] = useSearchParams();
  const { success, error: showError } = useToastStore();
  const { offerings, isLoading: offeringsLoading } = useMyTeachingOfferings();

  const initialOfferingId = params.offeringId ?? searchParams.get('offeringId') ?? '';
  const [offeringId, setOfferingId] = useState<string>(initialOfferingId);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const create = useCreateMaterial(offeringId);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { isExternalLink: false, category: 'Lectures' },
  });

  const isExternalLink = watch('isExternalLink');
  const category = watch('category');

  // When toggling between file/link, keep category sane.
  useEffect(() => {
    if (isExternalLink && category !== 'Links') setValue('category', 'Links');
    if (!isExternalLink && category === 'Links') setValue('category', 'Lectures');
  }, [isExternalLink, category, setValue]);

  const offeringLabel = useMemo(() => {
    const o = offerings.find((x) => x.id === offeringId);
    if (!o) return undefined;
    return o.courseCode ? `${o.courseCode} — ${o.courseTitle ?? ''}` : o.id;
  }, [offerings, offeringId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_MIME.includes(file.type)) {
      showError('Invalid file type. Allowed: PDF, MP4, PNG, JPEG, DOC.');
      e.target.value = '';
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      showError('File too large. Maximum size is 50MB.');
      e.target.value = '';
      return;
    }
    setSelectedFile(file);
  };

  const onSubmit = async (data: FormValues) => {
    if (!offeringId) {
      showError('Please select a course offering first.');
      return;
    }
    if (!data.isExternalLink && !selectedFile) {
      showError('A file is required for non-link materials.');
      return;
    }
    try {
      await create.mutateAsync({
        title: data.title,
        description: data.description,
        category: data.category as Phase4MaterialCategory,
        isExternalLink: data.isExternalLink,
        url: data.isExternalLink ? data.url : undefined,
        file: data.isExternalLink ? undefined : selectedFile ?? undefined,
      });
      success('Material uploaded successfully.');
      navigate(`/dashboard/course-offerings/${offeringId}/materials`);
    } catch (err) {
      showError(getApiErrorMessage(err, 'Failed to upload material.'));
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Upload Material</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Add a new resource to {offeringLabel ?? 'a course offering'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary-600" />
            Material Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {!params.offeringId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  Course Offering *
                </label>
                <select
                  value={offeringId}
                  onChange={(e) => setOfferingId(e.target.value)}
                  disabled={offeringsLoading}
                  className="field"
                >
                  <option value="">{offeringsLoading ? 'Loading…' : 'Select a course…'}</option>
                  {offerings.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.courseCode ? `${o.courseCode} — ${o.courseTitle ?? ''}` : o.id}
                      {o.semester ? ` (${o.semester}${o.academicYear ? ' ' + o.academicYear : ''})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <Input label="Title *" placeholder="Enter material title" {...register('title')} error={errors.title?.message} />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Description</label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Optional description"
                className="field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Material Type *</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setValue('isExternalLink', false)}
                  className={`flex-1 px-4 py-3 border-2 rounded-lg transition-all ${
                    !isExternalLink ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <FileText className="h-5 w-5 mx-auto mb-2" />
                  File Upload
                </button>
                <button
                  type="button"
                  onClick={() => setValue('isExternalLink', true)}
                  className={`flex-1 px-4 py-3 border-2 rounded-lg transition-all ${
                    isExternalLink ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <LinkIcon className="h-5 w-5 mx-auto mb-2" />
                  External Link
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">Category *</label>
              <select
                {...register('category')}
                className="field"
              >
                {isExternalLink ? (
                  <option value="Links">Links</option>
                ) : (
                  fileCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))
                )}
              </select>
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>}
            </div>

            {isExternalLink ? (
              <Input
                label="URL *"
                type="url"
                placeholder="https://example.com/resource"
                {...register('url')}
                error={errors.url?.message}
              />
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">File *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                    accept=".pdf,.mp4,.png,.jpg,.jpeg,.doc"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600 mb-1">Click to choose a file</p>
                    <p className="text-xs text-gray-500">PDF, MP4, PNG, JPEG, DOC — max 50MB</p>
                  </label>
                  {selectedFile && (
                    <div className="mt-4 flex items-center justify-center gap-2 p-2 bg-gray-50 rounded">
                      <FileText className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-700">
                        {selectedFile.name} · {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                      <button type="button" onClick={() => setSelectedFile(null)} className="text-red-600 hover:text-red-700">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() =>
                  navigate(offeringId ? `/dashboard/course-offerings/${offeringId}/materials` : '/dashboard/materials')
                }
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={create.isPending} disabled={!offeringId} className="flex-1">
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
