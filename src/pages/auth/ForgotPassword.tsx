import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, ArrowLeft, CheckCircle, CreditCard } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';
import { authApi } from '@/lib/api';
import { logger } from '@/lib/logger';

const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  nationalID: z.string().min(14, 'National ID must be 14 digits').max(14, 'National ID must be 14 digits'),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export function ForgotPassword() {
  const { t } = useTranslation();
  const { success, error: showError } = useToastStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await authApi.forgotPassword({
        email: data.email.trim(),
        nationalID: data.nationalID.trim(),
      });
      setIsSuccess(true);
      success(t('auth.resetLinkSent') || 'Reset link sent to your email');
    } catch (error) {
      logger.error('Failed to send reset link', {
        context: 'ForgotPassword',
        error,
      });
      const axiosError = error as { response?: { data?: { message?: string } } };
      const message = axiosError?.response?.data?.message || t('auth.resetLinkError') || 'Error sending reset link';
      showError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-gray-100/50 p-4 relative overflow-hidden">
      {/* Clean professional background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `linear-gradient(to right, #0055cc 1px, transparent 1px),
                           linear-gradient(to bottom, #0055cc 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}></div>
        
        {/* Minimal floating elements */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary-100 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-accent-100 rounded-full blur-3xl opacity-15"></div>
      </div>

      <Card className="w-full max-w-lg relative z-10 animate-fade-in-up shadow-xl border border-gray-100 bg-white/95 backdrop-blur-md hover:shadow-2xl hover:bg-white transition-all duration-300 rounded-2xl overflow-hidden">
        {/* Elegant top border */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-500 to-transparent"></div>
        
        <CardHeader className="pb-4">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">{t('auth.backToLogin')}</span>
          </Link>

          <div className="flex justify-center mb-4 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
              <div className="relative z-10 bg-primary-50 p-4 rounded-2xl">
                <Mail className="h-12 w-12 text-primary-500" />
              </div>
            </div>
          </div>
          <CardTitle className="text-center text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent animate-fade-in font-cairo" style={{ animationDelay: '0.3s' }}>
            {t('auth.resetPasswordTitle')}
          </CardTitle>
          <p className="text-center text-sm text-gray-500 mt-2 animate-fade-in" style={{ animationDelay: '0.35s' }}>
            {t('auth.enterEmail')}
          </p>
        </CardHeader>
        <CardContent className="pt-2">
          {isSuccess ? (
            <div className="text-center py-8 animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('common.success')}
              </h3>
              <p className="text-gray-600 mb-6">
                {t('auth.resetPassword')} - Reset link has been sent to your email
              </p>
              <Link to="/login">
                <Button className="w-full">
                  {t('auth.backToLogin')}
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
                <div className="relative">
                  <Input
                    label={t('auth.email')}
                    type="email"
                    placeholder="student@university.edu"
                    error={errors.email?.message}
                    className="transition-all duration-300 hover:shadow-md focus:shadow-lg focus:ring-2 focus:ring-primary-500/30 border-2 py-3 text-base pr-12"
                    {...register('email')}
                  />
                  <div className="absolute right-3 top-9 text-primary-500 bg-primary-50 p-1.5 rounded-lg">
                    <Mail className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div className="animate-fade-in-up" style={{ animationDelay: '0.55s' }}>
                <div className="relative">
                  <Input
                    label={t('auth.nationalId') || 'National ID'}
                    type="text"
                    placeholder="12345678901234"
                    error={errors.nationalID?.message}
                    className="transition-all duration-300 hover:shadow-md focus:shadow-lg focus:ring-2 focus:ring-primary-500/30 border-2 py-3 text-base pr-12"
                    {...register('nationalID')}
                  />
                  <div className="absolute right-3 top-9 text-primary-500 bg-primary-50 p-1.5 rounded-lg">
                    <CreditCard className="h-4 w-4" />
                  </div>
                </div>
              </div>

              <div className="animate-fade-in-up pt-2" style={{ animationDelay: '0.6s' }}>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3.5 text-base transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] rounded-xl"
                  isLoading={isLoading}
                >
                  {t('auth.sendResetLink')}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

