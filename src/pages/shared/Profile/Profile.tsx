import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Avatar } from '@/components/ui/Avatar';
import { 
  User,
  CreditCard,
  GraduationCap,
  Edit2,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import { IStudent } from '@/types';
import { logger } from '@/lib/logger';

export function Profile() {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const { success, error: showError } = useToastStore();
  const student = user as IStudent;

  // Password change states
  const [isChangingPassword, setIsChangingPassword] = useState(false);
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
    setIsChangingPassword(false);
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
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600 dark:text-gray-400">{t('shared.profile.loading')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('nav.profile')}</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">{t('shared.profile.subtitle')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                {t('shared.profile.personalInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Avatar */}
              <div className="flex items-center gap-4">
                <Avatar
                  src={user.avatarUrl}
                  name={user.name}
                  size="xl"
                />
                <div>
                  <p className="font-semibold text-lg">{user.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {user.role === 'student' ? t('shared.profile.student') : user.role}
                  </p>
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('shared.profile.fullName')}
                </label>
                <p className="text-gray-900 dark:text-white py-2">{user.name}</p>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('shared.profile.emailAddress')}
                </label>
                <p className="text-gray-900 dark:text-white py-2">{user.email}</p>
              </div>

              {/* National ID */}
              {user.nationalId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('shared.profile.nationalId')}
                  </label>
                  <p className="text-gray-900 dark:text-white py-2">{user.nationalId}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('shared.profile.cannotChange')}</p>
                </div>
              )}

            </CardContent>
          </Card>

          {/* Academic Information (Read-only for students) */}
          {student && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  {t('shared.profile.academicInfo')}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('shared.profile.year')}
                    </label>
                    <p className="text-gray-900 dark:text-white py-2">{t('shared.profile.yearValue', { year: student.year })}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('shared.profile.semester')}
                    </label>
                    <p className="text-gray-900 dark:text-white py-2">{t('shared.profile.semesterValue', { semester: student.semester })}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('shared.profile.creditsEarned')}
                    </label>
                    <p className="text-gray-900 dark:text-white py-2">{t('shared.profile.creditsValue', { credits: student.creditsEarned })}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('shared.profile.gpa')}
                    </label>
                    <p className="text-gray-900 dark:text-white py-2 font-semibold">
                      {student.gpa > 0 ? student.gpa.toFixed(2) : t('shared.profile.notAvailable')}
                    </p>
                  </div>
                </div>

                {student.department && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        {t('shared.profile.department')}
                      </label>
                      <p className="text-gray-900 dark:text-white py-2">
                        {student.department.name} ({student.department.code})
                      </p>
                    </div>
                    {student.department.college && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t('shared.profile.college')}
                        </label>
                        <p className="text-gray-900 dark:text-white py-2">
                          {student.department.college.name} ({student.department.college.code})
                        </p>
                      </div>
                    )}
                  </>
                )}

                {student.academicStatus && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('shared.profile.academicStatus')}
                    </label>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getAcademicStatusColor(
                        student.academicStatus
                      )}`}
                    >
                      {getAcademicStatusLabel(student.academicStatus)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Security */}
        <div className="space-y-6">
          {/* Change Password */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  {t('shared.profile.security')}
                </CardTitle>
                {!isChangingPassword && (
                  <Button variant="ghost" size="sm" onClick={() => setIsChangingPassword(true)}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    {t('shared.profile.change')}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isChangingPassword ? (
                otpStep ? (
                <div className="space-y-4">
                  <p className="rounded-lg border border-primary-200 bg-primary-50 px-3 py-2 text-sm text-primary-800 dark:border-primary-500/30 dark:bg-primary-500/10 dark:text-primary-200">
                    {t('shared.profile.otpSent')}
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('shared.profile.currentPassword')}
                    </label>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordData.currentPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, currentPassword: e.target.value })
                        }
                        placeholder={t('shared.profile.enterCurrentPassword')}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('shared.profile.newPassword')}
                    </label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, newPassword: e.target.value })
                        }
                        placeholder={t('shared.profile.enterNewPassword')}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {t('shared.profile.minCharsHint')}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('shared.profile.confirmNewPassword')}
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                        }
                        placeholder={t('shared.profile.confirmNewPlaceholder')}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      variant="outline"
                      onClick={handleCancelPassword}
                      disabled={loading}
                      className="flex-1"
                    >
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
                )
              ) : (
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t('shared.profile.securityNote')}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {t('shared.profile.accountInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('shared.profile.userId')}
                </label>
                <p className="text-gray-900 dark:text-white text-sm font-mono">{user.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('shared.profile.universityId')}
                </label>
                <p className="text-gray-900 dark:text-white text-sm font-mono">{user.universityId}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('shared.profile.role')}
                </label>
                <p className="text-gray-900 dark:text-white text-sm capitalize">{user.role}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

