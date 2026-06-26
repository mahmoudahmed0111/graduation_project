import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Select2 } from '@/components/ui/Select2';
import { useColleges } from '@/hooks/queries/useColleges';
import { useBulkImportUsers, useResendCredentials } from '@/hooks/queries/useUsers';
import { getApiErrorMessage } from '@/lib/http/client';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import type { BulkImportResult } from '@/services/users.service';
import type { UserListSegment } from '@/lib/userListPaths';
import { logger } from '@/lib/logger';
import { AlertTriangle, CheckCircle2, Download, FileSpreadsheet, Upload, X } from 'lucide-react';

const MAX_BYTES = 2 * 1024 * 1024;

/** Role written into the `role` column of the per-segment CSV template. */
const SEGMENT_ROLE: Record<UserListSegment, string> = {
  students: 'student',
  doctors: 'doctor',
  tas: 'ta',
  admins: 'collegeAdmin',
};

const SEGMENT_LABEL_KEY: Record<UserListSegment, string> = {
  students: 'admin.bulkImport.roleStudents',
  doctors: 'admin.bulkImport.roleDoctors',
  tas: 'admin.bulkImport.roleTas',
  admins: 'admin.bulkImport.roleAdmins',
};

export function BulkImportModal({
  isOpen,
  onClose,
  segment,
}: {
  isOpen: boolean;
  onClose: () => void;
  segment: UserListSegment;
}) {
  const { t } = useTranslation();
  const { user: auth } = useAuthStore();
  const isUA = auth?.role === 'universityAdmin';
  const { success, error: toastError } = useToastStore();

  const [collegeId, setCollegeId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<BulkImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bulkImport = useBulkImportUsers();
  const resend = useResendCredentials();

  const { data: collegesData } = useColleges({ limit: 100, isArchived: 'false' }, { enabled: isUA && isOpen });
  const collegeOptions = useMemo(() => {
    const items = collegesData?.items ?? [];
    return items.map((c) => {
      const rec = c as Record<string, unknown>;
      return { value: String(rec._id ?? rec.id ?? ''), label: String(rec.name ?? '') };
    });
  }, [collegesData?.items]);

  const roleLabel = t(SEGMENT_LABEL_KEY[segment]);

  const reset = () => {
    setCollegeId('');
    setFile(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const downloadTemplate = () => {
    const role = SEGMENT_ROLE[segment];
    const header = 'name,email,nationalID,phoneNumber,role';
    const example = `,,,,${role}`;
    // No BOM prefix: a leading BOM gets parsed as part of the first header by the
    // server, so the "name" column is not recognized and every row fails on import.
    const csv = `${header}\n${example}\n`;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `import_${segment}_template.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setResult(null);
    if (f && f.size > MAX_BYTES) {
      toastError(t('admin.bulkImport.errFileTooLarge'));
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setFile(f);
  };

  const handleImport = async () => {
    if (!file) {
      toastError(t('admin.bulkImport.errNoFile'));
      return;
    }
    if (isUA && !collegeId) {
      toastError(t('admin.bulkImport.errSelectCollege'));
      return;
    }
    const fd = new FormData();
    fd.append('file', file);
    if (isUA && collegeId) fd.append('college_id', collegeId);

    try {
      const res = await bulkImport.mutateAsync(fd);
      // Surface the raw server payload for diagnosing rejected rows.
      logger.info('Bulk import result', { context: 'BulkImportModal', data: { result: res } });
      setResult(res);
      if (res.created > 0) {
        success(t('admin.bulkImport.successToast', { created: res.created }));
      } else {
        toastError(t('admin.bulkImport.noneImportedToast'));
      }
    } catch (e) {
      toastError(getApiErrorMessage(e, t('admin.bulkImport.errImportFailed')));
    }
  };

  const handleResend = async () => {
    const logId = result?.log?.id;
    if (!logId) return;
    try {
      const res = await resend.mutateAsync(logId);
      success(t('admin.bulkImport.resendToast', { sent: res.sent, total: res.total }));
    } catch (e) {
      toastError(getApiErrorMessage(e, t('admin.bulkImport.errResendFailed')));
    }
  };

  const importing = bulkImport.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={t('admin.bulkImport.title', { role: roleLabel })}
      subtitle={t('admin.bulkImport.subtitle')}
      size="md"
    >
      {result ? (
        <div className="space-y-5">
          <div className="flex flex-col items-center gap-2 py-2 text-center">
            {result.created > 0 ? (
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
            ) : (
              <AlertTriangle className="h-12 w-12 text-red-500" />
            )}
            <p className="text-base font-semibold text-gray-900 dark:text-white">
              {result.created > 0 ? t('admin.bulkImport.resultTitle') : t('admin.bulkImport.resultNoneTitle')}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10">
              <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{result.created}</p>
              <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">{t('admin.bulkImport.created')}</p>
            </div>
            <div
              className={`rounded-xl border p-4 text-center ${
                result.failed > 0
                  ? 'border-red-200 bg-red-50/60 dark:border-red-500/30 dark:bg-red-500/10'
                  : 'border-gray-200 bg-gray-50 dark:border-dark-border dark:bg-white/5'
              }`}
            >
              <p
                className={`text-2xl font-bold ${
                  result.failed > 0 ? 'text-red-700 dark:text-red-300' : 'text-gray-700 dark:text-slate-300'
                }`}
              >
                {result.failed}
              </p>
              <p className="text-xs text-gray-500 dark:text-slate-400">{t('admin.bulkImport.failed')}</p>
            </div>
          </div>

          {result.created === 0 && result.failed === 0 && (
            <div className="rounded-xl border border-red-200 bg-red-50/50 p-3 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              {t('admin.bulkImport.noRowsHint')}
            </div>
          )}

          {result.created === 0 && result.failed > 0 && (
            <div className="space-y-2 rounded-xl border border-red-200 bg-red-50/50 p-3 text-xs text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
              <p>{t('admin.bulkImport.allFailedHint')}</p>
              {result.errors && result.errors.length > 0 && (
                <ul className="list-disc space-y-1 ps-4">
                  {result.errors.slice(0, 8).map((err, i) => (
                    <li key={i}>
                      {[
                        err.row != null ? `#${err.row}` : null,
                        err.email || err.nationalID,
                        err.message || err.reason || err.error,
                      ]
                        .filter(Boolean)
                        .join(' — ')}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {result.created > 0 && result.log?.id && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-3 text-xs text-gray-600 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-slate-300">
              <p className="mb-2">{t('admin.bulkImport.resendHint')}</p>
              <Button type="button" variant="secondary" size="sm" onClick={() => void handleResend()} disabled={resend.isPending}>
                <Upload className="me-1.5 h-3.5 w-3.5" />
                {resend.isPending ? t('admin.bulkImport.resending') : t('admin.bulkImport.resendFailed')}
              </Button>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={reset}>
              {t('admin.bulkImport.importAnother')}
            </Button>
            <Button type="button" variant="primary" onClick={handleClose}>
              {t('admin.bulkImport.done')}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50/60 p-3 dark:border-dark-border dark:bg-white/5">
            <FileSpreadsheet className="mt-0.5 h-5 w-5 shrink-0 text-primary-600 dark:text-accent-300" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{t('admin.bulkImport.step1Title')}</p>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-slate-400">{t('admin.bulkImport.templateHint')}</p>
              <Button type="button" variant="outline" size="sm" className="mt-2" onClick={downloadTemplate}>
                <Download className="me-1.5 h-3.5 w-3.5" />
                {t('admin.bulkImport.downloadTemplate')}
              </Button>
            </div>
          </div>

          {isUA && (
            <Select2
              label={t('admin.bulkImport.collegeLabel')}
              value={collegeId}
              onChange={setCollegeId}
              options={collegeOptions}
            />
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300">
              {t('admin.bulkImport.fileLabel')}
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
              onChange={handleFileChange}
              className="block w-full rounded-xl border border-gray-300 text-sm text-gray-600 file:me-4 file:border-0 file:bg-primary-50 file:px-4 file:py-2.5 file:text-sm file:font-medium file:text-primary-700 dark:border-dark-border dark:text-gray-400 dark:file:bg-primary-950/40 dark:file:text-primary-300"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">{t('admin.bulkImport.fileHint')}</p>
            {file && (
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-700 dark:text-slate-300">
                <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
                <span className="truncate">{file.name}</span>
                <button
                  type="button"
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="text-gray-400 hover:text-red-500"
                  aria-label={t('admin.bulkImport.removeFile')}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={handleClose}>
              {t('admin.bulkImport.cancel')}
            </Button>
            <Button type="button" variant="primary" onClick={() => void handleImport()} disabled={importing || !file}>
              <Upload className="me-2 h-4 w-4" />
              {importing ? t('admin.bulkImport.importing') : t('admin.bulkImport.import')}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
