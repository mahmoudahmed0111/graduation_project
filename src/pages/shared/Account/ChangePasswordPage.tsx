import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { authApi } from '@/lib/api';
import { getApiErrorMessage } from '@/lib/http/client';
import { useAuthStore } from '@/store/authStore';
import { useToastStore } from '@/store/toastStore';
import { Lock } from 'lucide-react';

export function ChangePasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const { success, error: toastError } = useToastStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [loading, setLoading] = useState(false);

  // Step 1: validate + request the OTP (backend emails a confirmation code).
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toastError(t('shared.accountChangePassword.errAllFields'));
      return;
    }
    if (newPassword.length < 8) {
      toastError(t('shared.accountChangePassword.errMinLen'));
      return;
    }
    if (newPassword !== confirmPassword) {
      toastError(t('shared.accountChangePassword.errMismatch'));
      return;
    }
    if (currentPassword === newPassword) {
      toastError(t('shared.accountChangePassword.errSameAsCurrent'));
      return;
    }
    setLoading(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setOtpStep(true);
      success(t('shared.accountChangePassword.otpSent'));
    } catch (err) {
      toastError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Step 2: confirm the OTP → backend applies the new password.
  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim()) {
      toastError(t('shared.accountChangePassword.errOtpRequired'));
      return;
    }
    setLoading(true);
    try {
      await authApi.confirmPasswordChange(otp.trim());
      if (user) {
        setUser({ ...user, requiresPasswordChange: false });
      }
      success(t('shared.accountChangePassword.passwordUpdated'));
      navigate('/dashboard', { replace: true });
    } catch (err) {
      toastError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-6 animate-fade-in-up">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Lock className="h-5 w-5 text-primary-600" />
            {t('shared.accountChangePassword.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {user?.requiresPasswordChange && (
            <p className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              {t('shared.accountChangePassword.adminRequiresChange')}
            </p>
          )}
          {otpStep ? (
            <form onSubmit={(e) => void handleConfirm(e)} className="space-y-4">
              <p className="rounded-lg border border-primary-200 bg-primary-50 px-3 py-2 text-sm text-primary-800 dark:border-primary-500/30 dark:bg-primary-900/20 dark:text-primary-200">
                {t('shared.accountChangePassword.otpSent')}
              </p>
              <Input
                label={t('shared.accountChangePassword.otpLabel')}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                autoFocus
              />
              <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                {loading ? t('shared.accountChangePassword.verifying') : t('shared.accountChangePassword.confirmChange')}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                disabled={loading}
                onClick={() => {
                  setOtpStep(false);
                  setOtp('');
                }}
              >
                {t('shared.accountChangePassword.back')}
              </Button>
            </form>
          ) : (
            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
              <Input
                label={t('shared.accountChangePassword.currentPassword')}
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
              <Input
                label={t('shared.accountChangePassword.newPassword')}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              <Input
                label={t('shared.accountChangePassword.confirmNewPassword')}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              <Button type="submit" variant="primary" className="w-full" disabled={loading}>
                {loading ? t('shared.accountChangePassword.saving') : t('shared.accountChangePassword.updatePassword')}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
