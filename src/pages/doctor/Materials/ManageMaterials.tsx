import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  FileText,
  BookOpen,
  Trash2,
  ExternalLink,
  Download,
  Plus,
  Search,
  Pencil,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { categoryColors, categoryIcons } from '@/constants/ui';
import { useToastStore } from '@/store/toastStore';
import { useAuthStore } from '@/store/authStore';
import { useDeleteMaterial, useMaterials } from '@/hooks/queries/usePhase4Materials';
import { useMyTeachingOfferings } from '@/hooks/queries/useMyOfferings';
import { getApiErrorMessage } from '@/lib/http/client';
import type { IPhase4Material, Phase4MaterialCategory } from '@/types';

const CATEGORY_OPTIONS: Array<'all' | Phase4MaterialCategory> = ['all', 'Lectures', 'Sheets', 'Readings', 'Links'];

function uploaderId(material: IPhase4Material): string | undefined {
  const u = material.uploadedBy_id;
  if (typeof u === 'string') return u;
  return u?._id;
}

function uploaderName(material: IPhase4Material): string {
  const u = material.uploadedBy_id;
  if (u && typeof u === 'object') return u.name;
  return 'Unknown';
}

export function ManageMaterials() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams<{ offeringId?: string }>();
  const { user } = useAuthStore();
  const { success, error: showError } = useToastStore();

  const { offerings, isLoading: offeringsLoading } = useMyTeachingOfferings();
  const [pickerOfferingId, setPickerOfferingId] = useState<string>('');

  const offeringId = params.offeringId ?? pickerOfferingId;

  const [category, setCategory] = useState<(typeof CATEGORY_OPTIONS)[number]>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmTarget, setConfirmTarget] = useState<IPhase4Material | null>(null);

  const list = useMaterials(offeringId || undefined, category === 'all' ? {} : { category });
  const remove = useDeleteMaterial(offeringId || '');

  const isStaff = user?.role === 'doctor' || user?.role === 'teacher' || user?.role === 'ta';
  const isDoctor = user?.role === 'doctor' || user?.role === 'teacher';

  const filtered = useMemo(() => {
    const items = list.data?.items ?? [];
    const q = searchTerm.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (m) =>
        m.title.toLowerCase().includes(q) ||
        (m.description ?? '').toLowerCase().includes(q) ||
        (m.fileName ?? '').toLowerCase().includes(q)
    );
  }, [list.data, searchTerm]);

  const canModify = (m: IPhase4Material) => {
    if (!isStaff) return false;
    if (isDoctor) return true;
    // TA — own materials only
    return uploaderId(m) === user?.id;
  };

  const handleDelete = async () => {
    if (!confirmTarget) return;
    try {
      await remove.mutateAsync(confirmTarget._id);
      success(t('doctor.manageMaterials.deleted'));
      setConfirmTarget(null);
    } catch (err) {
      showError(getApiErrorMessage(err, t('doctor.manageMaterials.failedDelete')));
    }
  };

  const offeringSelector = !params.offeringId && (
    <Card>
      <CardContent className="p-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">{t('doctor.manageMaterials.courseOffering')}</label>
        <select
          value={pickerOfferingId}
          onChange={(e) => setPickerOfferingId(e.target.value)}
          disabled={offeringsLoading}
          className="field"
        >
          <option value="">{offeringsLoading ? t('doctor.manageMaterials.loadingOfferings') : t('doctor.manageMaterials.selectOffering')}</option>
          {offerings.map((o) => (
            <option key={o.id} value={o.id}>
              {o.courseCode ? `${o.courseCode} — ${o.courseTitle ?? ''}` : o.id}
              {o.semester ? ` (${o.semester}${o.academicYear ? ' ' + o.academicYear : ''})` : ''}
            </option>
          ))}
        </select>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('doctor.manageMaterials.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t('doctor.manageMaterials.subtitle')}</p>
        </div>
        {offeringId && (
          <Link to={`/dashboard/course-offerings/${offeringId}/materials/upload`}>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {t('doctor.manageMaterials.uploadMaterial')}
            </Button>
          </Link>
        )}
      </div>

      {offeringSelector}

      {!offeringId ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">{t('doctor.manageMaterials.selectToView')}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder={t('doctor.manageMaterials.searchPlaceholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as (typeof CATEGORY_OPTIONS)[number])}
                  className="field"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c === 'all' ? t('doctor.manageMaterials.allCategories') : c}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {list.isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
            </div>
          ) : list.isError ? (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-red-600">{t('doctor.manageMaterials.failedLoad')}</p>
              </CardContent>
            </Card>
          ) : filtered.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">No materials found.</p>
                <Link to={`/dashboard/course-offerings/${offeringId}/materials/upload`}>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Upload first material
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((material) => {
                const Icon = categoryIcons[material.category];
                const editable = canModify(material);
                return (
                  <Card key={material._id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-2 rounded-lg ${categoryColors[material.category]}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className={`text-xs font-medium px-2 py-1 rounded ${categoryColors[material.category]}`}>
                            {material.category}
                          </span>
                        </div>
                        {editable && (
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() =>
                                navigate(`/dashboard/course-offerings/${offeringId}/materials/${material._id}/edit`)
                              }
                              title={t('doctor.manageMaterials.edit')}
                            >
                              <Pencil className="h-4 w-4 text-gray-600" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => setConfirmTarget(material)}
                              title={t('doctor.manageMaterials.delete')}
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{material.title}</h3>
                      {material.description && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{material.description}</p>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {material.isExternalLink ? (
                            <>
                              <ExternalLink className="h-4 w-4" />
                              <span>{t('doctor.manageMaterials.externalLink')}</span>
                            </>
                          ) : (
                            <>
                              <FileText className="h-4 w-4" />
                              <span>{(material.fileType ?? 'file').toUpperCase()}</span>
                            </>
                          )}
                        </div>
                        <a
                          href={material.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                          {material.isExternalLink ? <ExternalLink className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                          {material.isExternalLink ? t('doctor.manageMaterials.open') : t('doctor.manageMaterials.download')}
                        </a>
                      </div>

                      <div className="mt-2 text-xs text-gray-400">
                        {uploaderName(material)} · {new Date(material.createdAt).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        isOpen={Boolean(confirmTarget)}
        onClose={() => setConfirmTarget(null)}
        onConfirm={handleDelete}
        title={t('doctor.manageMaterials.confirmDeleteTitle')}
        message={t('doctor.manageMaterials.confirmDeleteMessage', { title: confirmTarget?.title })}
        confirmText={t('doctor.manageMaterials.delete')}
        variant="danger"
        isLoading={remove.isPending}
      />
    </div>
  );
}
