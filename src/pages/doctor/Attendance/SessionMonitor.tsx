import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft, QrCode, Fingerprint, Square, RefreshCw, UserPlus, PencilLine, CheckCircle2, XCircle,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/ui/StatCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner, PageSpinner } from '@/components/ui/Spinner';
import { Modal } from '@/components/ui/Modal';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import { useToastStore } from '@/store/toastStore';
import { getApiErrorMessage } from '@/lib/http/client';
import {
  useSessionReport, useSessions, useEnableQr, useQrToken, useEndSession, useManualMark, useOverrideRecord,
} from '@/hooks/queries/usePhase5Attendance';
import { refId, refName, buildQrPayload, type AbsentStudent, type AttendanceRecord } from '@/types/phase5';
import { formatDate } from '@/utils/formatters';

export function SessionMonitor() {
  const { t } = useTranslation();
  const { sessionId = '' } = useParams();
  const navigate = useNavigate();
  const { success, error: showError } = useToastStore();

  const report = useSessionReport(sessionId, true);
  const offeringId = refId(report.data?.session?.courseOffering_id) ?? '';
  const sessionsList = useSessions({ courseOffering_id: offeringId }, Boolean(offeringId));
  const fullSession = useMemo(
    () => sessionsList.data?.items.find((s) => s._id === sessionId),
    [sessionsList.data, sessionId]
  );

  const isActive = (report.data?.session?.status ?? fullSession?.status) === 'active';
  const [localQrEnabled, setLocalQrEnabled] = useState(false);
  const qrEnabled = Boolean(fullSession?.qrFallbackEnabled) || localQrEnabled;

  const qrToken = useQrToken(sessionId, qrEnabled && isActive);
  const enableQr = useEnableQr();
  const endSession = useEndSession();
  const manualMark = useManualMark(sessionId);
  const overrideRecord = useOverrideRecord(sessionId);

  const [manualTarget, setManualTarget] = useState<AbsentStudent | null>(null);
  const [overrideTarget, setOverrideTarget] = useState<AttendanceRecord | null>(null);
  const [reason, setReason] = useState('');
  const [endOpen, setEndOpen] = useState(false);

  const summary = report.data?.summary;

  const handleEnableQr = async () => {
    try {
      await enableQr.mutateAsync(sessionId);
      setLocalQrEnabled(true);
      success(t('attendance5.monitor.qrEnabledToast'));
      void qrToken.refetch();
    } catch (err) {
      showError(getApiErrorMessage(err, t('attendance5.monitor.qrEnableFailed')));
    }
  };

  const handleEnd = async () => {
    try {
      const res = await endSession.mutateAsync({ id: sessionId, reason: 'class_dismissed' });
      success(t('attendance5.monitor.endedToast', { count: res.attendanceCount }));
      navigate('/dashboard/attendance/sessions');
    } catch (err) {
      showError(getApiErrorMessage(err, t('attendance5.monitor.endFailed')));
    }
  };

  const submitManual = async () => {
    if (!manualTarget || !reason.trim()) return showError(t('attendance5.monitor.reasonRequired'));
    try {
      await manualMark.mutateAsync({ studentId: manualTarget._id, reason: reason.trim() });
      success(t('attendance5.monitor.markedToast', { name: manualTarget.name ?? t('attendance5.common.student') }));
      setManualTarget(null);
      setReason('');
    } catch (err) {
      showError(getApiErrorMessage(err, t('attendance5.monitor.markFailed')));
    }
  };

  const submitOverride = async () => {
    if (!overrideTarget || !reason.trim()) return showError(t('attendance5.monitor.reasonRequired'));
    try {
      await overrideRecord.mutateAsync({ recordId: overrideTarget._id, reason: reason.trim() });
      success(t('attendance5.monitor.recordUpdated'));
      setOverrideTarget(null);
      setReason('');
    } catch (err) {
      showError(getApiErrorMessage(err, t('attendance5.monitor.overrideFailed')));
    }
  };

  if (report.isLoading) return <PageSpinner label={t('attendance5.monitor.loadingSession')} />;

  const qrPayload = qrToken.data?.qrToken ? buildQrPayload(sessionId, qrToken.data.qrToken) : '';

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/dashboard/attendance/sessions')}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition-colors hover:text-primary-600 dark:text-slate-400 dark:hover:text-accent-300"
      >
        <ArrowLeft className="h-4 w-4 rtl:rotate-180" /> {t('attendance5.monitor.back')}
      </button>

      <PageHeader
        title={t('attendance5.monitor.title')}
        subtitle={isActive ? t('attendance5.monitor.liveSubtitle') : t('attendance5.monitor.endedSubtitle')}
        actions={
          <div className="flex items-center gap-2.5">
            {isActive && !qrEnabled && (
              <Button variant="secondary" onClick={handleEnableQr} isLoading={enableQr.isPending}>
                <QrCode className="h-4 w-4" /> {t('attendance5.monitor.enableQr')}
              </Button>
            )}
            {isActive && (
              <Button variant="danger" onClick={() => setEndOpen(true)}>
                <Square className="h-4 w-4" /> {t('attendance5.monitor.endSession')}
              </Button>
            )}
          </div>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard index={0} label={t('attendance5.monitor.total')} value={summary?.total ?? 0} tone="neutral" />
        <StatCard index={1} label={t('attendance5.common.present')} value={summary?.present ?? 0} tone="success" />
        <StatCard index={2} label={t('attendance5.common.absent')} value={summary?.absent ?? 0} tone="danger" />
        <StatCard index={3} label={t('attendance5.monitor.attendance')} value={`${(summary?.attendanceRate ?? 0).toFixed(0)}%`} tone="brand" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* QR panel */}
        {qrEnabled && isActive && (
          <SectionCard title={t('attendance5.monitor.scanTitle')} subtitle={t('attendance5.monitor.scanSubtitle')} className="lg:col-span-1">
            <div className="flex flex-col items-center gap-3">
              {qrPayload ? (
                <div className="rounded-2xl bg-white p-4 ring-1 ring-gray-200">
                  <QRCodeSVG value={qrPayload} size={208} level="M" />
                </div>
              ) : (
                <div className="flex h-[208px] w-[208px] items-center justify-center"><Spinner /></div>
              )}
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400">
                <RefreshCw className="h-3.5 w-3.5" /> {t('attendance5.monitor.refreshesEvery', { count: qrToken.data?.expiresIn ?? 30 })}
                <Button variant="ghost" size="sm" onClick={() => qrToken.refetch()}>{t('attendance5.monitor.refreshNow')}</Button>
              </div>
              {qrPayload && (
                <div className="w-full text-center">
                  <p className="text-[11px] text-gray-400 dark:text-slate-500">{t('attendance5.monitor.manualCode')}</p>
                  <code className="mt-1 block select-all break-all rounded-lg bg-gray-50 px-2 py-1 text-[10px] text-gray-600 dark:bg-dark-surface-2 dark:text-slate-300">
                    {`${sessionId}|${qrToken.data?.qrToken ?? ''}`}
                  </code>
                </div>
              )}
            </div>
          </SectionCard>
        )}

        {/* Roster */}
        <SectionCard
          title={t('attendance5.monitor.rosterTitle')}
          subtitle={fullSession?.templateLoadStatus === 'qr_fallback' ? t('attendance5.monitor.qrMode') : t('attendance5.monitor.fpMode')}
          className={qrEnabled && isActive ? 'lg:col-span-2' : 'lg:col-span-3'}
          action={isActive ? <Badge tone="success" dot>{t('attendance5.common.live')}</Badge> : <Badge tone="neutral">{t('attendance5.common.ended')}</Badge>}
          noPadding
        >
          <Table>
            <TableHeader sticky>
              <TableRow>
                <TableHead>{t('attendance5.common.student')}</TableHead>
                <TableHead>{t('attendance5.common.status')}</TableHead>
                <TableHead>{t('attendance5.common.source')}</TableHead>
                <TableHead>{''}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(report.data?.present ?? []).map((rec) => (
                <TableRow key={rec._id}>
                  <TableCell className="font-medium text-gray-900 dark:text-white">{refName(rec.student_id) ?? '—'}</TableCell>
                  <TableCell><Badge tone="success" size="sm"><CheckCircle2 className="h-3 w-3" /> {t('attendance5.common.present')}</Badge></TableCell>
                  <TableCell>
                    <Badge tone={rec.source === 'manual_override' ? 'gold' : rec.source === 'qr' ? 'info' : 'brand'} size="sm">
                      {rec.source === 'manual_override' ? t('attendance5.common.manual') : rec.source === 'qr' ? t('attendance5.common.qr') : t('attendance5.common.fingerprint')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {isActive && (
                      <button onClick={() => { setOverrideTarget(rec); setReason(''); }} className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:underline dark:text-accent-300">
                        <PencilLine className="h-3.5 w-3.5" /> {t('attendance5.monitor.override')}
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {(report.data?.absent ?? []).map((stu) => (
                <TableRow key={stu._id}>
                  <TableCell className="font-medium text-gray-900 dark:text-white">{stu.name ?? '—'}</TableCell>
                  <TableCell><Badge tone="danger" size="sm"><XCircle className="h-3 w-3" /> {t('attendance5.common.absent')}</Badge></TableCell>
                  <TableCell className="text-gray-400">—</TableCell>
                  <TableCell>
                    {isActive && (
                      <button onClick={() => { setManualTarget(stu); setReason(''); }} className="inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:underline dark:text-accent-300">
                        <UserPlus className="h-3.5 w-3.5" /> {t('attendance5.monitor.markPresent')}
                      </button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {(report.data?.present?.length ?? 0) + (report.data?.absent?.length ?? 0) === 0 && (
            <div className="p-5"><EmptyState variant="bare" icon={Fingerprint} title={t('attendance5.monitor.noStudentsTitle')} description={t('attendance5.monitor.noStudentsDesc')} /></div>
          )}
        </SectionCard>
      </div>

      {/* Manual mark modal */}
      <Modal
        isOpen={Boolean(manualTarget)}
        onClose={() => setManualTarget(null)}
        title={t('attendance5.monitor.markModalTitle')}
        subtitle={manualTarget?.name}
        footer={<>
          <Button variant="outline" onClick={() => setManualTarget(null)}>{t('attendance5.common.cancel')}</Button>
          <Button onClick={submitManual} isLoading={manualMark.isPending}>{t('attendance5.monitor.markPresent')}</Button>
        </>}
      >
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300">{t('attendance5.common.reason')}</label>
        <textarea className="field" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t('attendance5.monitor.markReasonPh')} />
      </Modal>

      {/* Override modal */}
      <Modal
        isOpen={Boolean(overrideTarget)}
        onClose={() => setOverrideTarget(null)}
        title={t('attendance5.monitor.overrideModalTitle')}
        subtitle={refName(overrideTarget?.student_id)}
        footer={<>
          <Button variant="outline" onClick={() => setOverrideTarget(null)}>{t('attendance5.common.cancel')}</Button>
          <Button onClick={submitOverride} isLoading={overrideRecord.isPending}>{t('attendance5.monitor.saveOverride')}</Button>
        </>}
      >
        <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300">{t('attendance5.common.reason')}</label>
        <textarea className="field" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder={t('attendance5.monitor.overrideReasonPh')} />
      </Modal>

      {/* End confirm */}
      <Modal
        isOpen={endOpen}
        onClose={() => setEndOpen(false)}
        title={t('attendance5.monitor.endModalTitle')}
        subtitle={t('attendance5.monitor.endModalSubtitle')}
        footer={<>
          <Button variant="outline" onClick={() => setEndOpen(false)}>{t('attendance5.common.cancel')}</Button>
          <Button variant="danger" onClick={handleEnd} isLoading={endSession.isPending}>{t('attendance5.monitor.endSession')}</Button>
        </>}
      >
        <p className="text-sm text-gray-500 dark:text-slate-400">
          {t('attendance5.monitor.startedAt', { date: formatDate(report.data?.session?.startTime ?? fullSession?.createdAt ?? '') })}
        </p>
      </Modal>
    </div>
  );
}
