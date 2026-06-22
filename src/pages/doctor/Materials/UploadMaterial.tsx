import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Upload, FileText, X, Link as LinkIcon } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select2 } from '@/components/ui/Select2';
import { AdminPageShell } from '@/components/admin/AdminPageShell';
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
  const { t } = useTranslation();
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
      showError(t('doctor.uploadMaterial.invalidFileType'));
      e.target.value = '';
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      showError(t('doctor.uploadMaterial.fileTooLarge'));
      e.target.value = '';
      return;
    }
    setSelectedFile(file);
  };

  const onSubmit = async (data: FormValues) => {
    if (!offeringId) {
      showError(t('doctor.uploadMaterial.selectOfferingFirst'));
      return;
    }
    if (!data.isExternalLink && !selectedFile) {
      showError(t('doctor.uploadMaterial.fileRequired'));
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
      success(t('doctor.uploadMaterial.uploadedSuccess'));
      navigate(`/dashboard/course-offerings/${offeringId}/materials`);
    } catch (err) {
      showError(getApiErrorMessage(err, t('doctor.uploadMaterial.failedUpload')));
    }
  };

  return (
    <AdminPageShell
      titleStack={{ section: t('nav.materials'), page: t('doctor.uploadMaterial.title') }}
      subtitle={t('doctor.uploadMaterial.subtitle', { offering: offeringLabel ?? t('doctor.uploadMaterial.aCourseOffering') })}
    >
      <div className="max-w-3xl mx-auto">
      <Card bare>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-primary-600" />
            {t('doctor.uploadMaterial.materialDetails')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {!params.offeringId && (
              <Select2
                label={t('doctor.uploadMaterial.courseOfferingLabel')}
                value={offeringId}
                onChange={setOfferingId}
                placeholder={offeringsLoading ? t('doctor.uploadMaterial.loading') : t('doctor.uploadMaterial.selectCourse')}
                options={offerings.map((o) => ({
                  value: o.id,
                  label:
                    (o.courseCode ? `${o.courseCode} — ${o.courseTitle ?? ''}` : o.id) +
                    (o.semester ? ` (${o.semester}${o.academicYear ? ' ' + o.academicYear : ''})` : ''),
                }))}
              />
            )}

            <Input label={t('doctor.uploadMaterial.titleLabel')} placeholder={t('doctor.uploadMaterial.titlePlaceholder')} {...register('title')} error={errors.title?.message} />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('doctor.uploadMaterial.descriptionLabel')}</label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder={t('doctor.uploadMaterial.descriptionPlaceholder')}
                className="field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('doctor.uploadMaterial.materialType')}</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setValue('isExternalLink', false)}
                  className={`flex-1 px-4 py-3 border-2 rounded-lg transition-all ${
                    !isExternalLink ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <FileText className="h-5 w-5 mx-auto mb-2" />
                  {t('doctor.uploadMaterial.fileUpload')}
                </button>
                <button
                  type="button"
                  onClick={() => setValue('isExternalLink', true)}
                  className={`flex-1 px-4 py-3 border-2 rounded-lg transition-all ${
                    isExternalLink ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <LinkIcon className="h-5 w-5 mx-auto mb-2" />
                  {t('doctor.uploadMaterial.externalLink')}
                </button>
              </div>
            </div>

            <Select2
              label={t('doctor.uploadMaterial.categoryLabel')}
              value={category}
              onChange={(v) => setValue('category', v as FormValues['category'], { shouldValidate: true })}
              options={
                isExternalLink
                  ? [{ value: 'Links', label: 'Links' }]
                  : fileCategories.map((c) => ({ value: c, label: c }))
              }
              searchable={false}
              error={errors.category?.message}
            />

            {isExternalLink ? (
              <Input
                label={t('doctor.uploadMaterial.urlLabel')}
                type="url"
                placeholder="https://example.com/resource"
                {...register('url')}
                error={errors.url?.message}
              />
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('doctor.uploadMaterial.fileLabel')}</label>
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
                    <p className="text-sm text-gray-600 mb-1">{t('doctor.uploadMaterial.clickToChoose')}</p>
                    <p className="text-xs text-gray-500">{t('doctor.uploadMaterial.fileTypes')}</p>
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
                {t('doctor.uploadMaterial.cancel')}
              </Button>
              <Button type="submit" isLoading={create.isPending} disabled={!offeringId} className="flex-1">
                <Upload className="h-4 w-4 mr-2" />
                {t('doctor.uploadMaterial.upload')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      </div>
    </AdminPageShell>
  );
}
