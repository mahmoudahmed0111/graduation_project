import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select2 } from '@/components/ui/Select2';
import { useColleges } from '@/hooks/queries/useColleges';
import { useBulkImportUsers, useResendCredentials } from '@/hooks/queries/useUsers';
import { getApiErrorMessage } from '@/lib/http/client';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { ArrowLeft, FileSpreadsheet, Upload } from 'lucide-react';

export function BulkImportUsersPage() {
  const { t } = useTranslation();
  const { user: auth } = useAuthStore();
  const isUA = auth?.role === 'universityAdmin';
  const { success, error: toastError } = useToastStore();
  const [file, setFile] = useState<File | null>(null);
  const [collegeId, setCollegeId] = useState('');
  const [lastLogId, setLastLogId] = useState<string | null>(null);
  const [summary, setSummary] = useState<{ created: number; failed: number } | null>(null);

  const importMutation = useBulkImportUsers();
  const resend = useResendCredentials();

  const { data: collegesData } = useColleges(
    { limit: 100, isArchived: 'false' },
    { enabled: isUA }
  );

  const collegeOptions =
    collegesData?.items.map((c) => {
      const rec = c as Record<string, unknown>;
      return { value: String(rec._id ?? rec.id ?? ''), label: String(rec.name ?? '') };
    }) ?? [];

  const handleImport = async () => {
    if (!file) {
      toastError(t('admin.bulkImportUsers.chooseFile'));
      return;
    }
    if (isUA && !collegeId) {
      toastError(t('admin.bulkImportUsers.collegeRequired'));
      return;
    }
    try {
      const result = await importMutation.mutateAsync({
        file,
        college_id: isUA ? collegeId : undefined,
      });
      setSummary({ created: result.created, failed: result.failed });
      setLastLogId(result.logId ?? null);
      success(t('admin.bulkImportUsers.importFinished', { created: result.created, failed: result.failed }));
    } catch (e) {
      toastError(getApiErrorMessage(e));
    }
  };

  const handleResend = async () => {
    if (!lastLogId) {
      toastError(t('admin.bulkImportUsers.noLogId'));
      return;
    }
    try {
      const r = await resend.mutateAsync(lastLogId);
      success(r.message);
    } catch (e) {
      toastError(getApiErrorMessage(e));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/users/students">
            <Button variant="secondary" size="sm" className="inline-flex items-center gap-2 rounded-xl">
              <ArrowLeft className="h-4 w-4" />
              {t('admin.bulkImportUsers.back')}
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('admin.bulkImportUsers.title')}</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {t('admin.bulkImportUsers.subtitle')}
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-gray-100">
            <FileSpreadsheet className="h-5 w-5 shrink-0 text-gray-500" />
            {t('admin.bulkImportUsers.importFile')}
          </CardTitle>
        </CardHeader>
        <CardContent className="mx-auto max-w-xl space-y-6">
          {isUA && (
            <Select2 label={t('admin.bulkImportUsers.college')} options={collegeOptions} value={collegeId} onChange={setCollegeId} />
          )}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.bulkImportUsers.spreadsheet')}</label>
            <input
              type="file"
              accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
              onChange={(e) => {
                setSummary(null);
                setFile(e.target.files?.[0] ?? null);
              }}
              className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700 dark:text-gray-400"
            />
          </div>
          <Button
            type="button"
            variant="primary"
            className="inline-flex items-center gap-2 rounded-xl"
            onClick={() => void handleImport()}
            disabled={importMutation.isPending}
          >
            <Upload className="h-4 w-4" />
            {importMutation.isPending ? t('admin.bulkImportUsers.uploading') : t('admin.bulkImportUsers.startImport')}
          </Button>

          {summary && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm dark:border-dark-border dark:bg-dark-bg">
              <p className="font-medium text-gray-900 dark:text-white">{t('admin.bulkImportUsers.lastResult')}</p>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                {t('admin.bulkImportUsers.created')}: <strong>{summary.created}</strong> · {t('admin.bulkImportUsers.failed')}: <strong>{summary.failed}</strong>
              </p>
              {lastLogId && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {t('admin.bulkImportUsers.logId')}: <code className="rounded bg-gray-200 px-1 dark:bg-gray-700">{lastLogId}</code>
                </p>
              )}
              {lastLogId && summary.failed > 0 && (
                <Button type="button" variant="secondary" className="mt-3 rounded-xl" onClick={() => void handleResend()}>
                  {t('admin.bulkImportUsers.resendCredentials')}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
