import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import { IStudent } from '@/types';
import { logger } from '@/lib/logger';

/** Semantic key-value table: each row is `<th scope="row">` label + `<td>` value. */
function InfoTable({ children }: { children: ReactNode }) {
  return (
    <table className="w-full border-collapse text-sm">
      <tbody className="divide-y divide-gray-100 dark:divide-dark-border">{children}</tbody>
    </table>
  );
}

function InfoRow({
  label,
  children,
  hint,
  mono,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
  mono?: boolean;
}) {
  return (
    <tr className="align-top">
      <th
        scope="row"
        className="w-2/5 whitespace-nowrap py-3 pe-4 text-start align-top text-sm font-medium text-gray-500 dark:text-slate-400"
      >
        {label}
      </th>
      <td className="py-3 text-start align-top">
        <div
          className={
            mono
              ? 'break-all font-mono text-[13px] text-gray-900 dark:text-white'
              : 'font-medium text-gray-900 dark:text-white'
          }
        >
          {children}
        </div>
        {hint && <p className="mt-1 text-xs font-normal text-gray-400 dark:text-slate-500">{hint}</p>}
      </td>
    </tr>
  );
}

export function Profile() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { success, error: showError } = useToastStore();
  const student = user as IStudent;

  // Password change states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [otp, setOtp] = useState('');
  const [otpStep, setOtpStep] = useState(false);

  const [loading, setLoading] = useState(false);

  const resetPasswordForm = () => {
    setOtpStep(false);
    setOtp('');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  // Step 1: validate + request the OTP (backend emails a confirmation code).
  const handleChangePassword = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      showError(t('shared.profile.errAllFields'));
      return;
    }

    if (passwordData.newPassword.length < 8) {
      showError(t('shared.profile.errMinLen'));
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showError(t('shared.profile.errMismatch'));
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      showError(t('shared.profile.errSameAsCurrent'));
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setOtpStep(true);
      success(t('shared.profile.otpSent'));
    } catch (err: unknown) {
      logger.error('Failed to change password', {
        context: 'Profile',
        error: err,
      });
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showError(msg || t('shared.profile.failedChange'));
    } finally {
      setLoading(false);
    }
  };

  // Step 2: confirm the OTP → backend applies the new password.
  const handleConfirmPasswordChange = async () => {
    if (!otp.trim()) {
      showError(t('shared.profile.errOtpRequired'));
      return;
    }
    setLoading(true);
    try {
      await authApi.confirmPasswordChange(otp.trim());
      resetPasswordForm();
      success(t('shared.profile.passwordChanged'));
    } catch (err: unknown) {
      logger.error('Failed to confirm password change', { context: 'Profile', error: err });
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      showError(msg || t('shared.profile.failedChange'));
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPassword = () => {
    resetPasswordForm();
  };

  const getAcademicStatusLabel = (status?: string) => {
    switch (status) {
      case 'good_standing':
        return t('shared.profile.statusGoodStanding');
      case 'probation':
        return t('shared.profile.statusProbation');
      case 'honors':
        return t('shared.profile.statusHonors');
      default:
        return t('shared.profile.notAvailable');
    }
  };

  const getAcademicStatusColor = (status?: string) => {
    switch (status) {
      case 'good_standing':
        return 'text-green-600 bg-green-50 dark:text-emerald-300 dark:bg-emerald-500/15';
      case 'probation':
        return 'text-orange-600 bg-orange-50 dark:text-orange-300 dark:bg-orange-500/15';
      case 'honors':
        return 'text-blue-600 bg-blue-50 dark:text-blue-300 dark:bg-blue-500/15';
      default:
        return 'text-gray-600 bg-gray-50 dark:text-slate-300 dark:bg-white/10';
    }
  };

  if (!user) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">{t('shared.profile.loading')}</p>
      </div>
    );
  }

  const avatarInitials =
    user.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2) || '?';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          {t('nav.profile')}
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">{t('shared.profile.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Info table — rendered after the image & password columns */}
        <div className="order-last space-y-6 lg:col-span-2">
          <Card>
            <CardContent>
              {/* All info rows in one continuous table */}
              <InfoTable>
                <InfoRow label={t('shared.profile.fullName')}>{user.name}</InfoRow>
                <InfoRow label={t('shared.profile.role')}>
                  <span className="capitalize">{user.role}</span>
                </InfoRow>
                <InfoRow label={t('shared.profile.emailAddress')}>{user.email}</InfoRow>
                {user.nationalId && (
                  <InfoRow label={t('shared.profile.nationalId')} hint={t('shared.profile.cannotChange')} mono>
                    {user.nationalId}
                  </InfoRow>
                )}

                {student && (
                  <>
                    <InfoRow label={t('shared.profile.year')}>
                      {t('shared.profile.yearValue', { year: student.year })}
                    </InfoRow>
                    <InfoRow label={t('shared.profile.semester')}>
                      {t('shared.profile.semesterValue', { semester: student.semester })}
                    </InfoRow>
                    <InfoRow label={t('shared.profile.creditsEarned')}>
                      {t('shared.profile.creditsValue', { credits: student.creditsEarned })}
                    </InfoRow>
                    <InfoRow label={t('shared.profile.gpa')}>
                      {student.gpa > 0 ? student.gpa.toFixed(2) : t('shared.profile.notAvailable')}
                    </InfoRow>
                    {student.department && (
                      <InfoRow label={t('shared.profile.department')}>
                        {student.department.name} ({student.department.code})
                      </InfoRow>
                    )}
                    {student.department?.college && (
                      <InfoRow label={t('shared.profile.college')}>
                        {student.department.college.name} ({student.department.college.code})
                      </InfoRow>
                    )}
                    {student.academicStatus && (
                      <InfoRow label={t('shared.profile.academicStatus')}>
                        <span
                          className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${getAcademicStatusColor(
                            student.academicStatus
                          )}`}
                        >
                          {getAcademicStatusLabel(student.academicStatus)}
                        </span>
                      </InfoRow>
                    )}
                  </>
                )}

                <InfoRow label={t('shared.profile.userId')} mono>
                  {user.id}
                </InfoRow>
                <InfoRow label={t('shared.profile.universityId')} mono>
                  {user.universityId}
                </InfoRow>
              </InfoTable>
            </CardContent>
          </Card>
        </div>

        {/* Image & password — at the start of the page */}
        <div className="order-first space-y-6">
          {/* Profile picture — fills the whole container */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="aspect-square w-full object-cover"
                />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center bg-primary-500 text-5xl font-medium text-white">
                  {avatarInitials}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary-600 dark:text-accent-300" />
                {t('shared.profile.security')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {otpStep ? (
                <div className="space-y-4">
                    <p className="rounded-lg border border-primary-200 bg-primary-50 px-3 py-2 text-sm text-primary-800 dark:border-primary-500/30 dark:bg-primary-500/10 dark:text-primary-200">
                      {t('shared.profile.otpSent')}
                    </p>
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('shared.profile.otpLabel')}
                      </label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        autoFocus
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <Button variant="outline" onClick={handleCancelPassword} disabled={loading} className="flex-1">
                        {t('shared.profile.cancel')}
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleConfirmPasswordChange}
                        isLoading={loading}
                        disabled={loading}
                        className="flex-1"
                      >
                        {t('shared.profile.confirmChange')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('shared.profile.currentPassword')}
                      </label>
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={passwordData.currentPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                          placeholder={t('shared.profile.enterCurrentPassword')}
                        />
                        <button
                          type="button"
                          className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('shared.profile.newPassword')}
                      </label>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? 'text' : 'password'}
                          value={passwordData.newPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                          placeholder={t('shared.profile.enterNewPassword')}
                        />
                        <button
                          type="button"
                          className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {t('shared.profile.minCharsHint')}
                      </p>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t('shared.profile.confirmNewPassword')}
                      </label>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={passwordData.confirmPassword}
                          onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                          placeholder={t('shared.profile.confirmNewPlaceholder')}
                        />
                        <button
                          type="button"
                          className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button variant="outline" onClick={handleCancelPassword} disabled={loading} className="flex-1">
                        {t('shared.profile.cancel')}
                      </Button>
                      <Button
                        variant="primary"
                        onClick={handleChangePassword}
                        isLoading={loading}
                        disabled={loading}
                        className="flex-1"
                      >
                        {t('shared.profile.changePassword')}
                      </Button>
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
