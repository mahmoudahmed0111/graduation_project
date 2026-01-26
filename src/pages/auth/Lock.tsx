import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/authStore';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Lock as LockIcon, User, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useToastStore } from '@/store/toastStore';
import { logger } from '@/lib/logger';

const lockSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

type LockFormData = z.infer<typeof lockSchema>;

export function Lock() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const { error: showError, success } = useToastStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LockFormData>({
    resolver: zodResolver(lockSchema),
  });

  const onSubmit = async (data: LockFormData) => {
    try {
      setIsLoading(true);
      // In real app, verify password with backend
      // For now, using a simple check (in production, this should verify against the actual user password)
      // This is a mock - replace with actual password verification
      if (data.password === 'password123' || data.password.length >= 6) {
        // Password verified - unlock and redirect to dashboard
        success('Screen unlocked successfully');
        navigate('/dashboard');
      } else {
        showError('Incorrect password. Please try again.');
      }
    } catch (err: any) {
      logger.error('Failed to unlock screen', {
        context: 'Lock',
        error: err,
      });
      showError(err.response?.data?.message || 'Failed to unlock screen');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-gray-100/50 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `linear-gradient(to right, #0055cc 1px, transparent 1px),
                           linear-gradient(to bottom, #0055cc 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}></div>
        
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary-100 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-accent-100 rounded-full blur-3xl opacity-15"></div>
      </div>

      <Card className="w-full max-w-md relative z-10 animate-fade-in-up shadow-xl border border-gray-100 bg-white/95 backdrop-blur-md hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-500 to-transparent"></div>
        
        <CardHeader className="pb-4">
          <div className="flex justify-center mb-6 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <img 
              src="/logo/logo.png.png" 
              alt="University Logo" 
              className="h-20 w-auto object-contain"
            />
          </div>

          <CardTitle className="text-center text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent animate-fade-in font-cairo" style={{ animationDelay: '0.3s' }}>
            Screen Locked
          </CardTitle>
          <p className="text-center text-sm text-gray-500 mt-2 animate-fade-in" style={{ animationDelay: '0.35s' }}>
            Enter your password to unlock
          </p>
        </CardHeader>

        <CardContent className="pt-2">
          {/* User Info */}
          {user && (
            <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex-shrink-0">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-12 w-12 rounded-full border-2 border-primary-200"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center border-2 border-primary-200">
                    <User className="h-6 w-6 text-primary-600" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-sm text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  error={errors.password?.message}
                  className="transition-all duration-300 hover:shadow-md focus:shadow-lg focus:ring-2 focus:ring-primary-500/30 border-2 py-3 text-base pr-12"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-500 hover:text-primary-500 transition-colors p-1.5 rounded-lg hover:bg-primary-50"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="animate-fade-in-up pt-2" style={{ animationDelay: '0.6s' }}>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3.5 text-base transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] rounded-xl"
                isLoading={isLoading}
              >
                <LockIcon className="h-4 w-4 mr-2" />
                Unlock
              </Button>
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-primary-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Sign in as different user
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

