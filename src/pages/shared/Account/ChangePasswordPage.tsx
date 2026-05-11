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
  const [loading, setLoading] = useState(false);

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
        </CardContent>
      </Card>
    </div>
  );
}
