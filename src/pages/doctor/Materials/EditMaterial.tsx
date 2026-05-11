import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FileText, Link as LinkIcon, Save, Upload, X } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToastStore } from '@/store/toastStore';
import { useMaterial, useUpdateMaterial } from '@/hooks/queries/usePhase4Materials';
import { getApiErrorMessage } from '@/lib/http/client';
import type { Phase4MaterialCategory } from '@/types';

const ACCEPTED_MIME = ['application/pdf', 'video/mp4', 'image/png', 'image/jpeg', 'application/msword'];
const MAX_FILE_BYTES = 50 * 1024 * 1024;
const fileCategories = ['Lectures', 'Sheets', 'Readings'] as const;

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.enum(['Lectures', 'Sheets', 'Readings', 'Links']),
  isExternalLink: z.boolean(),
  url: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

export function EditMaterial() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { offeringId, id } = useParams<{ offeringId: string; id: string }>();
  const { success, error: showError } = useToastStore();

  const detail = useMaterial(offeringId, id);
  const update = useUpdateMaterial(offeringId ?? '');

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { isExternalLink: false, category: 'Lectures' },
  });

  useEffect(() => {
    if (detail.data) {
      reset({
        title: detail.data.title,
        description: detail.data.description ?? '',
        category: detail.data.category,
        isExternalLink: detail.data.isExternalLink,
        url: detail.data.isExternalLink ? detail.data.url : '',
      });
    }
  }, [detail.data, reset]);

  const isExternalLink = watch('isExternalLink');
  const category = watch('category');

  useEffect(() => {
    if (isExternalLink && category !== 'Links') setValue('category', 'Links');
    if (!isExternalLink && category === 'Links') setValue('category', 'Lectures');
  }, [isExternalLink, category, setValue]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_MIME.includes(file.type)) {
      showError(t('doctor.editMaterial.invalidFileType'));
      e.target.value = '';
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      showError(t('doctor.editMaterial.fileTooLarge'));
      e.target.value = '';
      return;
    }
    setSelectedFile(file);
  };

  const onSubmit = async (data: FormValues) => {
    if (!offeringId || !id) return;
    if (data.isExternalLink && !data.url) {
      showError(t('doctor.editMaterial.urlRequired'));
      return;
    }
    if (!data.isExternalLink && detail.data?.isExternalLink && !selectedFile) {
      showError(t('doctor.editMaterial.fileRequired'));
      return;
    }
    try {
      await update.mutateAsync({
        materialId: id,
        input: {
          title: data.title,
          description: data.description,
          category: data.category as Phase4MaterialCategory,
          isExternalLink: data.isExternalLink,
          url: data.isExternalLink ? data.url : undefined,
          file: !data.isExternalLink ? selectedFile ?? undefined : undefined,
        },
      });
      success(t('doctor.editMaterial.updated'));
      navigate(`/dashboard/course-offerings/${offeringId}/materials`);
    } catch (err) {
      showError(getApiErrorMessage(err, t('doctor.editMaterial.failedUpdate')));
    }
  };

  if (detail.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (detail.isError || !detail.data) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-red-600">{t('doctor.editMaterial.notFound')}</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('doctor.editMaterial.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{t('doctor.editMaterial.subtitle')}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-5 w-5 text-primary-600" /> {t('doctor.editMaterial.materialDetails')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input label={t('doctor.editMaterial.titleLabel')} {...register('title')} error={errors.title?.message} />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('doctor.editMaterial.descriptionLabel')}</label>
              <textarea
                {...register('description')}
                rows={3}
                className="field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('doctor.editMaterial.materialType')}</label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setValue('isExternalLink', false)}
                  className={`flex-1 px-4 py-3 border-2 rounded-lg ${
                    !isExternalLink ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-700'
                  }`}
                >
                  <FileText className="h-5 w-5 mx-auto mb-2" /> {t('doctor.editMaterial.file')}
                </button>
                <button
                  type="button"
                  onClick={() => setValue('isExternalLink', true)}
                  className={`flex-1 px-4 py-3 border-2 rounded-lg ${
                    isExternalLink ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-300 text-gray-700'
                  }`}
                >
                  <LinkIcon className="h-5 w-5 mx-auto mb-2" /> {t('doctor.editMaterial.link')}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('doctor.editMaterial.categoryLabel')}</label>
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
            </div>

            {isExternalLink ? (
              <Input label={t('doctor.editMaterial.urlLabel')} type="url" {...register('url')} error={errors.url?.message} />
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                  {t('doctor.editMaterial.replaceFile')}
                </label>
                <p className="text-xs text-gray-500 mb-2">{t('doctor.editMaterial.leaveEmpty')}</p>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="edit-file"
                    accept=".pdf,.mp4,.png,.jpg,.jpeg,.doc"
                  />
                  <label htmlFor="edit-file" className="cursor-pointer flex flex-col items-center">
                    <Upload className="h-8 w-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">{t('doctor.editMaterial.clickToChoose')}</p>
                    <p className="text-xs text-gray-500">{t('doctor.editMaterial.fileTypes')}</p>
                  </label>
                  {selectedFile && (
                    <div className="mt-3 flex items-center justify-center gap-2 p-2 bg-gray-50 rounded">
                      <FileText className="h-4 w-4 text-gray-600" />
                      <span className="text-sm">{selectedFile.name}</span>
                      <button type="button" onClick={() => setSelectedFile(null)} className="text-red-600">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {!selectedFile && detail.data.fileName && (
                    <p className="mt-3 text-xs text-gray-500">{t('doctor.editMaterial.currentFile', { name: detail.data.fileName })}</p>
                  )}
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => navigate(`/dashboard/course-offerings/${offeringId}/materials`)}
              >
                {t('doctor.editMaterial.cancel')}
              </Button>
              <Button type="submit" isLoading={update.isPending} className="flex-1">
                <Save className="h-4 w-4 mr-2" /> {t('doctor.editMaterial.saveChanges')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
