import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Download, ExternalLink, FileText, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { categoryColors, categoryIcons } from '@/constants/ui';
import { useMaterial } from '@/hooks/queries/usePhase4Materials';

export function MaterialDetail() {
  const { t } = useTranslation();
  const { offeringId, id } = useParams<{ offeringId: string; id: string }>();
  const detail = useMaterial(offeringId, id);

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
        <CardContent className="p-12 text-center text-red-600">{t('shared.materialDetail.notFound')}</CardContent>
      </Card>
    );
  }

  const m = detail.data;
  const Icon = categoryIcons[m.category];
  const uploader = typeof m.uploadedBy_id === 'object' ? m.uploadedBy_id : null;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <Link
        to={`/dashboard/course-offerings/${offeringId}/materials`}
        className="inline-flex items-center gap-1 text-sm text-primary-600 hover:text-primary-700"
      >
        <ArrowLeft className="h-4 w-4" /> {t('shared.materialDetail.backToMaterials')}
      </Link>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg ${categoryColors[m.category]}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded ${categoryColors[m.category]}`}>{m.category}</span>
            </div>
            <a href={m.url} target="_blank" rel="noopener noreferrer">
              <Button variant="primary">
                {m.isExternalLink ? <ExternalLink className="h-4 w-4 mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                {m.isExternalLink ? t('shared.materialDetail.openLink') : t('shared.materialDetail.download')}
              </Button>
            </a>
          </div>
          <CardTitle className="mt-4">{m.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {m.description && <p className="text-gray-700 dark:text-gray-300">{m.description}</p>}

          <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t border-gray-100">
            <div>
              <div className="text-gray-500">{t('shared.materialDetail.type')}</div>
              <div className="font-medium flex items-center gap-1">
                {m.isExternalLink ? <ExternalLink className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                {m.isExternalLink ? t('shared.materialDetail.externalLink') : (m.fileType ?? t('shared.materialDetail.fileFallback')).toUpperCase()}
              </div>
            </div>
            {m.fileName && (
              <div>
                <div className="text-gray-500">{t('shared.materialDetail.fileName')}</div>
                <div className="font-medium">{m.fileName}</div>
              </div>
            )}
            <div>
              <div className="text-gray-500">{t('shared.materialDetail.uploaded')}</div>
              <div className="font-medium">{new Date(m.createdAt).toLocaleString()}</div>
            </div>
            {uploader && (
              <div>
                <div className="text-gray-500">{t('shared.materialDetail.uploadedBy')}</div>
                <div className="font-medium flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {uploader.name}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
