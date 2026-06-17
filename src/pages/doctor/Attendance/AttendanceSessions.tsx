import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Radio, Play, MapPin, Clock, ChevronRight, Fingerprint, QrCode } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Spinner } from '@/components/ui/Spinner';
import { Select2 } from '@/components/ui/Select2';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableEmpty } from '@/components/ui/Table';
import { useToastStore } from '@/store/toastStore';
import { getApiErrorMessage } from '@/lib/http/client';
import { useMyTeachingOfferings } from '@/hooks/queries/useMyOfferings';
import { useSessions, useCreateSession } from '@/hooks/queries/usePhase5Attendance';
import type { AttendanceSession } from '@/types/phase5';
import { formatDate } from '@/utils/formatters';

function locationLabel(session: AttendanceSession): string {
  const loc = session.location_id;
  if (!loc) return '—';
  if (typeof loc === 'string') return loc;
  return [loc.name, loc.roomNumber].filter(Boolean).join(' · ') || '—';
}

export function AttendanceSessions() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { success, error: showError } = useToastStore();
  const { offerings, isLoading: offeringsLoading } = useMyTeachingOfferings();
  const [selectedOffering, setSelectedOffering] = useState('');
  const [conflictReason, setConflictReason] = useState('');
  const [conflictOpen, setConflictOpen] = useState(false);

  const sessionsQuery = useSessions(
    { courseOffering_id: selectedOffering },
    Boolean(selectedOffering)
  );
  const createSession = useCreateSession();

  const sessions = sessionsQuery.data?.items ?? [];
  const active = useMemo(() => sessions.filter((s) => s.status === 'active'), [sessions]);
  const ended = useMemo(() => sessions.filter((s) => s.status === 'ended'), [sessions]);

  const offeringOptions = [
    { value: '', label: t('attendance5.common.selectCourse') },
    ...offerings.map((o) => ({
      value: o.id,
      label: `${o.courseCode ?? ''} — ${o.courseTitle ?? o.id}`.trim(),
    })),
  ];

  const handleStart = async (force = false) => {
    if (!selectedOffering) {
      showError(t('attendance5.sessions.selectCourseFirst'));
      return;
    }
    if (force && !conflictReason.trim()) {
      showError(t('attendance5.sessions.reasonRequiredSwitch'));
      return;
    }
    try {
      const res = await createSession.mutateAsync({
        courseOffering_id: selectedOffering,
        ...(force ? { forceHallSwitch: true, hallSwitchReason: conflictReason.trim() } : {}),
      });
      if (res.outcome === 'conflict') {
        setConflictOpen(true);
        return;
      }
      setConflictOpen(false);
      setConflictReason('');
      if (res.outcome === 'alreadyActive') {
        success(t('attendance5.sessions.alreadyActiveToast'));
      } else {
        success(
          res.templateLoadStatus === 'qr_fallback'
            ? t('attendance5.sessions.startedQrToast')
            : t('attendance5.sessions.startedLoadedToast', { count: res.session?.templatesLoadedCount ?? 0 })
        );
      }
      const id = res.session?._id;
      if (id) navigate(`/dashboard/attendance/sessions/${id}`);
      else void sessionsQuery.refetch();
    } catch (err) {
      showError(getApiErrorMessage(err, t('attendance5.sessions.startFailed')));
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('attendance5.sessions.title')}
        subtitle={t('attendance5.sessions.subtitle')}
      />

      <SectionCard title={t('attendance5.sessions.startTitle')} subtitle={t('attendance5.sessions.startSubtitle')}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300">{t('attendance5.common.course')}</label>
            {offeringsLoading ? (
              <div className="flex h-11 items-center"><Spinner size="sm" /></div>
            ) : (
              <Select2 value={selectedOffering} onChange={setSelectedOffering} options={offeringOptions} placeholder={t('attendance5.common.selectCourse')} />
            )}
          </div>
          <Button
            onClick={() => handleStart(false)}
            isLoading={createSession.isPending}
            disabled={!selectedOffering}
          >
            <Play className="h-4 w-4" /> {t('attendance5.sessions.startBtn')}
          </Button>
        </div>
      </SectionCard>

      {/* Active sessions */}
      <SectionCard
        title={t('attendance5.sessions.activeTitle')}
        action={active.length > 0 ? <Badge tone="success" dot>{t('attendance5.sessions.liveCount', { count: active.length })}</Badge> : undefined}
        noPadding
      >
        {!selectedOffering ? (
          <div className="p-5">
            <EmptyState variant="bare" icon={Radio} title={t('attendance5.sessions.pickCourseTitle')} description={t('attendance5.sessions.pickCourseDesc')} />
          </div>
        ) : sessionsQuery.isLoading ? (
          <div className="flex justify-center p-10"><Spinner /></div>
        ) : active.length === 0 ? (
          <div className="p-5">
            <EmptyState variant="bare" icon={Radio} title={t('attendance5.sessions.noActiveTitle')} description={t('attendance5.sessions.noActiveDesc')} />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-2">
            {active.map((s) => (
              <button
                key={s._id}
                onClick={() => navigate(`/dashboard/attendance/sessions/${s._id}`)}
                className="card is-hoverable text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
                    <Radio className="h-4 w-4 animate-pulse text-emerald-500" /> {t('attendance5.sessions.liveSession')}
                  </span>
                  <Badge tone={s.templateLoadStatus === 'qr_fallback' ? 'gold' : 'brand'}>
                    {s.templateLoadStatus === 'qr_fallback' ? (
                      <><QrCode className="h-3 w-3" /> {t('attendance5.sessions.qrFallback')}</>
                    ) : (
                      <><Fingerprint className="h-3 w-3" /> {t('attendance5.sessions.loadedCount', { count: s.templatesLoadedCount })}</>
                    )}
                  </Badge>
                </div>
                <div className="mt-3 space-y-1.5 text-sm text-gray-500 dark:text-slate-400">
                  <p className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {locationLabel(s)}</p>
                  <p className="flex items-center gap-2"><Clock className="h-4 w-4" /> {t('attendance5.sessions.endsAt', { date: formatDate(s.expiresAt) })}</p>
                </div>
                <div className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary-600 dark:text-accent-300">
                  {t('attendance5.sessions.openMonitor')} <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                </div>
              </button>
            ))}
          </div>
        )}
      </SectionCard>

      {/* Past sessions */}
      {selectedOffering && ended.length > 0 && (
        <SectionCard title={t('attendance5.sessions.pastTitle')} noPadding>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('attendance5.sessions.colLocation')}</TableHead>
                <TableHead>{t('attendance5.sessions.colStarted')}</TableHead>
                <TableHead>{t('attendance5.sessions.colEnded')}</TableHead>
                <TableHead>{t('attendance5.sessions.colMode')}</TableHead>
                <TableHead>{''}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ended.length === 0 ? (
                <TableEmpty colSpan={5}>
                  <EmptyState variant="bare" title={t('attendance5.sessions.noPast')} />
                </TableEmpty>
              ) : (
                ended.map((s) => (
                  <TableRow key={s._id} onClick={() => navigate(`/dashboard/attendance/sessions/${s._id}`)}>
                    <TableCell>{locationLabel(s)}</TableCell>
                    <TableCell>{formatDate(s.createdAt ?? '')}</TableCell>
                    <TableCell>{s.endedAt ? formatDate(s.endedAt) : '—'}</TableCell>
                    <TableCell>
                      <Badge tone="neutral" size="sm">{s.templateLoadStatus === 'qr_fallback' ? t('attendance5.common.qr') : t('attendance5.common.fingerprint')}</Badge>
                    </TableCell>
                    <TableCell className="text-primary-600 dark:text-accent-300">{t('attendance5.sessions.viewReport')}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </SectionCard>
      )}

      {/* Hall conflict modal */}
      <Modal
        isOpen={conflictOpen}
        onClose={() => setConflictOpen(false)}
        title={t('attendance5.sessions.conflictTitle')}
        subtitle={t('attendance5.sessions.conflictSubtitle')}
        footer={
          <>
            <Button variant="outline" onClick={() => setConflictOpen(false)}>{t('attendance5.common.cancel')}</Button>
            <Button variant="danger" isLoading={createSession.isPending} onClick={() => handleStart(true)}>
              {t('attendance5.sessions.forceSwitch')}
            </Button>
          </>
        }
      >
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300">{t('attendance5.sessions.reasonForSwitch')}</label>
        <textarea
          className="field"
          rows={3}
          value={conflictReason}
          onChange={(e) => setConflictReason(e.target.value)}
          placeholder={t('attendance5.sessions.reasonSwitchPh')}
        />
      </Modal>
    </div>
  );
}
