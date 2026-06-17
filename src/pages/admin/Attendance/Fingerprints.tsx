import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Fingerprint, ScanLine, CheckCircle2, Trash2, ShieldCheck, Clock } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { Select2 } from '@/components/ui/Select2';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { useToastStore } from '@/store/toastStore';
import { getApiErrorMessage } from '@/lib/http/client';
import { useUsers } from '@/hooks/queries/useUsers';
import {
  useFingerprintTemplates, useCheckFingerprint, useEnrollMode, useDeleteFingerprint,
} from '@/hooks/queries/usePhase5Attendance';
import { refId, refName, type FingerprintTemplate } from '@/types/phase5';
import { formatDate } from '@/utils/formatters';

function readField(o: unknown, ...keys: string[]): string | undefined {
  if (!o || typeof o !== 'object') return undefined;
  const rec = o as Record<string, unknown>;
  for (const k of keys) if (typeof rec[k] === 'string') return rec[k] as string;
  return undefined;
}

export function Fingerprints() {
  const { t } = useTranslation();
  const { success, error: showError } = useToastStore();
  const studentsQuery = useUsers({ role: 'student', limit: 100 });
  const templatesQuery = useFingerprintTemplates();
  const enrollMode = useEnrollMode();
  const deleteFp = useDeleteFingerprint();

  const [studentId, setStudentId] = useState('');
  const check = useCheckFingerprint(studentId || undefined);

  // enrollment "live" window
  const [enrolling, setEnrolling] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [enrollDevice, setEnrollDevice] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [toDelete, setToDelete] = useState<FingerprintTemplate | null>(null);

  const studentOptions = useMemo(() => {
    const items = (studentsQuery.data?.items ?? []) as unknown[];
    return [
      { value: '', label: t('attendance5.common.selectStudent') },
      ...items
        .map((u) => {
          const id = readField(u, '_id', 'id') ?? '';
          const name = readField(u, 'name') ?? '';
          const email = readField(u, 'email') ?? '';
          return { value: id, label: `${name}${email ? ` · ${email}` : ''}`.trim() || id };
        })
        .filter((o) => o.value),
    ];
  }, [studentsQuery.data, t]);

  // countdown + polling while enrolling
  useEffect(() => {
    if (!enrolling) return;
    const tick = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    pollRef.current = setInterval(() => {
      void check.refetch();
      void templatesQuery.refetch();
    }, 3000);
    return () => {
      clearInterval(tick);
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [enrolling]); // eslint-disable-line react-hooks/exhaustive-deps

  // stop enrolling once captured or time runs out
  useEffect(() => {
    if (enrolling && check.data?.enrolled) {
      setEnrolling(false);
      success(t('attendance5.fingerprints.capturedToast'));
    }
  }, [check.data?.enrolled, enrolling, success, t]);

  useEffect(() => {
    if (enrolling && secondsLeft === 0) setEnrolling(false);
  }, [secondsLeft, enrolling]);

  const startEnroll = async () => {
    if (!studentId) return showError(t('attendance5.fingerprints.selectStudentFirst'));
    try {
      const res = await enrollMode.mutateAsync({ studentId });
      setEnrollDevice(res.deviceId);
      setSecondsLeft(res.expiresIn || 120);
      setEnrolling(true);
      success(t('attendance5.fingerprints.enrollStarted'));
    } catch (err) {
      showError(getApiErrorMessage(err, t('attendance5.fingerprints.enrollFailed')));
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteFp.mutateAsync(toDelete._id);
      success(t('attendance5.fingerprints.removedToast'));
      setToDelete(null);
      void check.refetch();
    } catch (err) {
      showError(getApiErrorMessage(err, t('attendance5.fingerprints.removeFailed')));
    }
  };

  const templates = templatesQuery.data?.items ?? [];
  const enrolled = check.data?.enrolled;

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('attendance5.fingerprints.title')}
        subtitle={t('attendance5.fingerprints.subtitle')}
      />

      <SectionCard title={t('attendance5.fingerprints.enrollTitle')} subtitle={t('attendance5.fingerprints.enrollSubtitle')}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300">{t('attendance5.common.student')}</label>
            {studentsQuery.isLoading ? (
              <div className="flex h-11 items-center"><Spinner size="sm" /></div>
            ) : (
              <Select2 value={studentId} onChange={(v) => { setStudentId(v); setEnrolling(false); }} options={studentOptions} placeholder={t('attendance5.common.selectStudent')} />
            )}
          </div>
          {!enrolled && (
            <Button onClick={startEnroll} isLoading={enrollMode.isPending} disabled={!studentId || enrolling}>
              <ScanLine className="h-4 w-4" /> {t('attendance5.fingerprints.startEnroll')}
            </Button>
          )}
        </div>

        {studentId && (
          <div className="mt-4">
            {check.isLoading ? (
              <div className="flex items-center gap-2 text-sm text-gray-500"><Spinner size="xs" /> {t('attendance5.fingerprints.checking')}</div>
            ) : enrolling ? (
              <div className="flex items-center gap-3 rounded-xl border border-primary-200 bg-primary-50 p-4 dark:border-dark-border dark:bg-primary-900/30">
                <Spinner size="sm" />
                <div className="text-sm">
                  <p className="font-semibold text-primary-800 dark:text-accent-300">{t('attendance5.fingerprints.waitingScan')} <code>{enrollDevice || 'central'}</code>…</p>
                  <p className="flex items-center gap-1 text-gray-500 dark:text-slate-400"><Clock className="h-3.5 w-3.5" /> {t('attendance5.fingerprints.secondsRemaining', { count: secondsLeft })}</p>
                </div>
              </div>
            ) : enrolled ? (
              <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-dark-border dark:bg-emerald-500/10">
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-4 w-4" /> {t('attendance5.fingerprints.enrolled')}
                  {typeof check.data?.template?.quality === 'number' && <Badge tone="success" size="sm">{t('attendance5.fingerprints.quality', { value: check.data.template.quality })}</Badge>}
                </span>
                <Button variant="danger" size="sm" onClick={() => setToDelete(check.data?.template ?? null)}>
                  <Trash2 className="h-4 w-4" /> {t('attendance5.common.remove')}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 dark:border-dark-border dark:bg-dark-surface-2 dark:text-slate-300">
                <Fingerprint className="h-4 w-4" /> {t('attendance5.fingerprints.noFpForStudent')}
              </div>
            )}
          </div>
        )}
      </SectionCard>

      <SectionCard
        title={t('attendance5.fingerprints.registeredTitle')}
        action={<Badge tone="neutral"><ShieldCheck className="h-3 w-3" /> {t('attendance5.fingerprints.records', { count: templates.length })}</Badge>}
        noPadding
      >
        {templatesQuery.isLoading ? (
          <div className="flex justify-center p-10"><Spinner /></div>
        ) : templates.length === 0 ? (
          <div className="p-5"><EmptyState variant="bare" icon={Fingerprint} title={t('attendance5.fingerprints.noneTitle')} description={t('attendance5.fingerprints.noneDesc')} /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('attendance5.common.student')}</TableHead>
                <TableHead>{t('attendance5.fingerprints.colQuality')}</TableHead>
                <TableHead>{t('attendance5.fingerprints.colDevice')}</TableHead>
                <TableHead>{t('attendance5.fingerprints.colEnrolledBy')}</TableHead>
                <TableHead>{t('attendance5.common.date')}</TableHead>
                <TableHead>{''}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {templates.map((tpl) => (
                <TableRow key={tpl._id}>
                  <TableCell className="font-medium text-gray-900 dark:text-white">{refName(tpl.student_id) ?? refId(tpl.student_id) ?? '—'}</TableCell>
                  <TableCell>{typeof tpl.quality === 'number' ? <Badge tone={tpl.quality >= 80 ? 'success' : 'warning'} size="sm">{tpl.quality}</Badge> : '—'}</TableCell>
                  <TableCell className="text-gray-500 dark:text-slate-400">{tpl.enrolledViaDevice ?? '—'}</TableCell>
                  <TableCell className="text-gray-500 dark:text-slate-400">{refName(tpl.enrolledBy) ?? '—'}</TableCell>
                  <TableCell className="text-gray-500 dark:text-slate-400">{formatDate(tpl.createdAt ?? '')}</TableCell>
                  <TableCell>
                    <button onClick={() => setToDelete(tpl)} className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline dark:text-red-400">
                      <Trash2 className="h-3.5 w-3.5" /> {t('attendance5.common.remove')}
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </SectionCard>

      <ConfirmDialog
        isOpen={Boolean(toDelete)}
        onClose={() => setToDelete(null)}
        onConfirm={confirmDelete}
        title={t('attendance5.fingerprints.confirmTitle')}
        message={t('attendance5.fingerprints.confirmMsg')}
        confirmText={t('attendance5.common.remove')}
        variant="danger"
        isLoading={deleteFp.isPending}
      />
    </div>
  );
}
