import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminPageShell } from '@/components/admin';
import { Button } from '@/components/ui/Button';
import { Select2 } from '@/components/ui/Select2';
import { useColleges } from '@/hooks/queries/useColleges';
import { useBulkImportUsers, useResendCredentials } from '@/hooks/queries/useUsers';
import { getApiErrorMessage } from '@/lib/http/client';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { ArrowLeft, Upload } from 'lucide-react';

export function BulkImportUsersPage() {
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
      toastError('Choose an Excel or CSV file (max 2MB).');
      return;
    }
    if (isUA && !collegeId) {
      toastError('College is required for bulk import.');
      return;
    }
    try {
      const result = await importMutation.mutateAsync({
        file,
        college_id: isUA ? collegeId : undefined,
      });
      setSummary({ created: result.created, failed: result.failed });
      setLastLogId(result.logId ?? null);
      success(`Import finished: ${result.created} created, ${result.failed} failed.`);
    } catch (e) {
      toastError(getApiErrorMessage(e));
    }
  };

  const handleResend = async () => {
    if (!lastLogId) {
      toastError('No import log id yet. Run an import first.');
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
    <AdminPageShell
      title="Bulk import users"
      subtitle=".xlsx or .csv, max 2MB and 500 rows. College admins are scoped automatically."
      breadcrumbs={[{ label: 'User Management' }, { label: 'Users' }, { label: 'Bulk import' }]}
      actions={
        <Link to="/dashboard/users/directory">
          <Button type="button" variant="ghost" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
      }
    >
      <div className="mx-auto max-w-xl space-y-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-dark-border dark:bg-dark-surface">
        {isUA && (
          <Select2 label="College" options={collegeOptions} value={collegeId} onChange={setCollegeId} />
        )}
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Spreadsheet</label>
          <input
            type="file"
            accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
            onChange={(e) => {
              setSummary(null);
              setFile(e.target.files?.[0] ?? null);
            }}
            className="block w-full text-sm text-gray-600 file:mr-4 file:rounded-lg file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700"
          />
        </div>
        <Button
          type="button"
          variant="primary"
          className="gap-2"
          onClick={() => void handleImport()}
          disabled={importMutation.isPending}
        >
          <Upload className="h-4 w-4" />
          {importMutation.isPending ? 'Uploading…' : 'Start import'}
        </Button>

        {summary && (
          <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm dark:border-dark-border dark:bg-dark-bg">
            <p className="font-medium text-gray-900 dark:text-white">Last result</p>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Created: <strong>{summary.created}</strong> · Failed: <strong>{summary.failed}</strong>
            </p>
            {lastLogId && (
              <p className="mt-2 text-xs text-gray-500">
                Log id: <code className="rounded bg-gray-200 px-1 dark:bg-gray-700">{lastLogId}</code>
              </p>
            )}
            {lastLogId && summary.failed > 0 && (
              <Button type="button" variant="secondary" className="mt-3" onClick={() => void handleResend()}>
                Resend credentials (failed emails)
              </Button>
            )}
          </div>
        )}
      </div>
    </AdminPageShell>
  );
}
