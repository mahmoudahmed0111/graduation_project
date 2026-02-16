import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Lock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api';

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    passwordConfirm: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export function ResetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const { success, error: showError } = useToastStore();
  const { setUser, setAccessToken, setAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token?.trim()) {
      showError('Invalid or missing reset link. Please request a new one.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await authApi.resetPassword(token, {
        password: data.password,
        passwordConfirm: data.passwordConfirm,
      });
      setUser(res.user);
      setAccessToken(res.accessToken);
      setAuthenticated(true);
      success(t('auth.passwordResetSuccess') || 'Password reset successfully. You are now logged in.');
      navigate('/dashboard');
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const message = axiosError?.response?.data?.message || 'Invalid or expired link. Please request a new password reset.';
      showError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-gray-100/50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600 mb-4">Invalid or missing reset link.</p>
            <Link to="/forgot-password">
              <Button variant="outline" className="w-full">Request new reset link</Button>
            </Link>
            <Link to="/login" className="block mt-3 text-center text-sm text-primary-600 hover:underline">
              Back to Login
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-gray-100/50 p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `linear-gradient(to right, #0055cc 1px, transparent 1px), linear-gradient(to bottom, #0055cc 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary-100 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-accent-100 rounded-full blur-3xl opacity-15" />
      </div>

      <Card className="w-full max-w-lg relative z-10 shadow-xl border border-gray-100 bg-white/95 backdrop-blur-md rounded-2xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-500 to-transparent" />
        <CardHeader className="pb-4">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">{t('auth.backToLogin')}</span>
          </Link>
          <CardTitle className="text-center text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
            {t('auth.resetPasswordTitle') || 'Reset Your Password'}
          </CardTitle>
          <p className="text-center text-sm text-gray-500 mt-2">
            Enter your new password below.
          </p>
        </CardHeader>
        <CardContent className="pt-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="relative">
              <Input
                label={t('auth.newPassword') || 'New password'}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                error={errors.password?.message}
                className="pr-24"
                {...register('password')}
              />
              <div className="absolute right-3 top-9 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-primary-500 p-1.5 rounded-lg hover:bg-gray-100"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
                <div className="text-primary-500 bg-primary-50 p-1.5 rounded-lg">
                  <Lock className="h-4 w-4" />
                </div>
              </div>
            </div>
            <Input
              label={t('auth.confirmPassword') || 'Confirm password'}
              type="password"
              placeholder="••••••••"
              error={errors.passwordConfirm?.message}
              {...register('passwordConfirm')}
            />
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3.5 rounded-xl"
              isLoading={isLoading}
            >
              {t('auth.resetPassword') || 'Reset Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
