import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QrCode, Keyboard, History, CheckCircle2, ScanLine, Fingerprint } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { Select2 } from '@/components/ui/Select2';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { QrScanner } from '@/components/attendance/QrScanner';
import { useToastStore } from '@/store/toastStore';
import { getApiErrorMessage } from '@/lib/http/client';
import { api } from '@/lib/api';
import { useQrMark, useMyAttendance } from '@/hooks/queries/usePhase5Attendance';
import { parseQrPayload, type AttendanceSource } from '@/types/phase5';
import type { IEnrollment } from '@/types';
import { formatDate } from '@/utils/formatters';

type Tab = 'mark' | 'history';

const SOURCE_TONE: Record<AttendanceSource, 'brand' | 'info' | 'gold'> = {
  fingerprint: 'brand',
  qr: 'info',
  manual_override: 'gold',
};

export function Attendance() {
  const { t } = useTranslation();
  const { success, error: showError } = useToastStore();
  const [tab, setTab] = useState<Tab>('mark');

  // ─── courses (for both tabs) ───────────────────────────────────────────
  const [courses, setCourses] = useState<IEnrollment[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [selectedOffering, setSelectedOffering] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await api.getMyCourses({ semester: 'current' }).catch(() => []);
        if (alive) setCourses(Array.isArray(data) ? data : []);
      } finally {
        if (alive) setCoursesLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const offeringOptions = useMemo(
    () => [
      { value: '', label: t('attendance5.common.selectCourse') },
      ...courses
        .map((c) => ({
          value: c.courseOffering?.id ?? '',
          label: `${c.courseOffering?.course?.code ?? ''} — ${c.courseOffering?.course?.title ?? ''}`.trim(),
        }))
        .filter((o) => o.value),
    ],
    [courses, t]
  );

  // ─── mark (QR scan + manual) ───────────────────────────────────────────
  const qrMark = useQrMark();
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [marked, setMarked] = useState(false);

  const submitCode = async (raw: string) => {
    const payload = parseQrPayload(raw);
    if (!payload) {
      showError(t('attendance5.student.invalidCode'));
      return;
    }
    try {
      const res = await qrMark.mutateAsync(payload);
      setScanning(false);
      if (res.alreadyMarked) {
        success(t('attendance5.student.alreadyMarked'));
      } else {
        success(t('attendance5.student.recorded'));
      }
      setMarked(true);
      setManualCode('');
    } catch (err) {
      showError(getApiErrorMessage(err, t('attendance5.student.recordFailed')));
    }
  };

  // ─── history ───────────────────────────────────────────────────────────
  const history = useMyAttendance(tab === 'history' ? selectedOffering : undefined);
  const summary = history.data?.summary;

  return (
    <div className="space-y-6">
      <PageHeader title={t('attendance5.student.title')} subtitle={t('attendance5.student.subtitle')} />

      {/* Tabs */}
      <div className="inline-flex rounded-xl bg-gray-100 p-1 dark:bg-dark-surface-2">
        <button
          onClick={() => setTab('mark')}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${tab === 'mark' ? 'bg-white text-primary-700 shadow-sm dark:bg-dark-surface dark:text-accent-300' : 'text-gray-500 dark:text-slate-400'}`}
        >
          <ScanLine className="h-4 w-4" /> {t('attendance5.student.tabMark')}
        </button>
        <button
          onClick={() => setTab('history')}
          className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${tab === 'history' ? 'bg-white text-primary-700 shadow-sm dark:bg-dark-surface dark:text-accent-300' : 'text-gray-500 dark:text-slate-400'}`}
        >
          <History className="h-4 w-4" /> {t('attendance5.student.tabHistory')}
        </button>
      </div>

      {tab === 'mark' ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SectionCard title={t('attendance5.student.scanTitle')} subtitle={t('attendance5.student.scanSubtitle')}>
            {marked ? (
              <div className="py-6 text-center">
                <div className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-500/15">
                  <CheckCircle2 className="h-7 w-7 text-emerald-600 dark:text-emerald-300" />
                </div>
                <p className="font-semibold text-gray-900 dark:text-white">{t('attendance5.student.markedPresent')}</p>
                <Button variant="ghost" className="mt-3" onClick={() => { setMarked(false); setScanning(false); }}>
                  {t('attendance5.student.scanAgain')}
                </Button>
              </div>
            ) : scanning ? (
              <div className="space-y-3">
                <QrScanner active={scanning} onResult={submitCode} onError={(m) => { setScanning(false); showError(m || t('attendance5.student.cameraUnavailable')); }} />
                <Button variant="outline" className="w-full" onClick={() => setScanning(false)}>{t('attendance5.student.stopCamera')}</Button>
              </div>
            ) : (
              <div className="py-6 text-center">
                <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 dark:bg-primary-900/40 dark:text-accent-300">
                  <QrCode className="h-8 w-8" />
                </div>
                <Button onClick={() => setScanning(true)}>
                  <ScanLine className="h-4 w-4" /> {t('attendance5.student.openCamera')}
                </Button>
                {qrMark.isPending && <div className="mt-3 flex justify-center"><Spinner size="sm" /></div>}
              </div>
            )}
          </SectionCard>

          <SectionCard title={t('attendance5.student.manualTitle')} subtitle={t('attendance5.student.manualSubtitle')}>
            <div className="space-y-3">
              <div className="relative">
                <Keyboard className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  className="input pl-9"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder={t('attendance5.student.pasteCode')}
                />
              </div>
              <Button className="w-full" disabled={!manualCode.trim()} isLoading={qrMark.isPending} onClick={() => submitCode(manualCode)}>
                {t('attendance5.student.markPresent')}
              </Button>
            </div>
          </SectionCard>
        </div>
      ) : (
        <div className="space-y-6">
          <SectionCard title={t('attendance5.student.chooseCourse')}>
            {coursesLoading ? (
              <div className="flex h-11 items-center"><Spinner size="sm" /></div>
            ) : (
              <Select2 value={selectedOffering} onChange={setSelectedOffering} options={offeringOptions} placeholder={t('attendance5.common.selectCourse')} />
            )}
          </SectionCard>

          {!selectedOffering ? (
            <EmptyState icon={History} title={t('attendance5.student.pickCourseTitle')} description={t('attendance5.student.pickCourseDesc')} />
          ) : history.isLoading ? (
            <div className="flex justify-center p-10"><Spinner /></div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                <StatCard index={0} label={t('attendance5.student.attended')} value={summary?.attended ?? 0} tone="success" />
                <StatCard index={1} label={t('attendance5.student.totalSessions')} value={summary?.total ?? 0} tone="neutral" />
                <StatCard index={2} label={t('attendance5.student.percentage')} value={`${(summary?.percentage ?? 0).toFixed(0)}%`} tone="brand" />
                <StatCard index={3} label={t('attendance5.student.attendanceGrade')} value={summary?.attendanceGrade ?? 0} tone="gold" />
              </div>

              <SectionCard title={t('attendance5.student.records')} noPadding>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('attendance5.common.date')}</TableHead>
                      <TableHead>{t('attendance5.common.source')}</TableHead>
                      <TableHead>{t('attendance5.common.status')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(history.data?.records ?? []).map((rec) => (
                      <TableRow key={rec._id}>
                        <TableCell>{formatDate(rec.timestamp ?? rec.scannedAt ?? rec.createdAt ?? '')}</TableCell>
                        <TableCell>
                          <Badge tone={SOURCE_TONE[rec.source] ?? 'neutral'} size="sm">
                            {rec.source === 'manual_override' ? t('attendance5.common.manual') : rec.source === 'qr' ? t('attendance5.common.qr') : t('attendance5.common.fingerprint')}
                          </Badge>
                        </TableCell>
                        <TableCell><Badge tone="success" size="sm"><CheckCircle2 className="h-3 w-3" /> {t('attendance5.common.present')}</Badge></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {(history.data?.records?.length ?? 0) === 0 && (
                  <div className="p-5"><EmptyState variant="bare" icon={Fingerprint} title={t('attendance5.student.noRecordsTitle')} description={t('attendance5.student.noRecordsDesc')} /></div>
                )}
              </SectionCard>
            </>
          )}
        </div>
      )}
    </div>
  );
}
