import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { validateNationalId, validateUniversityEmail } from '@/lib/utils';
import { useTenantStore } from '@/store/tenantStore';
import { useToastStore } from '@/store/toastStore';
import { useLoginAttemptsStore } from '@/store/loginAttemptsStore';
import { Mail, Lock, Eye, EyeOff, CreditCard } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().optional(),
  nationalId: z.string().optional(),
  password: z.string().min(1, 'Password is required'),
}).refine((data) => (data.email?.trim()?.length ?? 0) > 0 || (data.nationalId?.trim()?.length ?? 0) > 0, {
  message: 'Enter either Email or National ID',
  path: ['email'],
});

type LoginFormData = z.infer<typeof loginSchema>;

export function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { currentUniversity } = useTenantStore();
  const { success, error: showError } = useToastStore();
  const { recordFailedAttempt, recordSuccessAttempt, getAttemptInfo } = useLoginAttemptsStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState<number | null>(null);
  const [isDeactivated, setIsDeactivated] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const email = watch('email');
  const nationalId = watch('nationalId');

  // Check lockout status on email or nationalId change
  useEffect(() => {
    const identifier = email || nationalId;
    if (identifier) {
      const attemptInfo = getAttemptInfo(identifier);
      setIsDeactivated(attemptInfo.isDeactivated);
      setLockoutSeconds(attemptInfo.lockoutSeconds);
    } else {
      setIsDeactivated(false);
      setLockoutSeconds(null);
    }
  }, [email, nationalId, getAttemptInfo]);

  // Countdown timer for lockout
  useEffect(() => {
    if (lockoutSeconds === null || lockoutSeconds <= 0) return;

    const timer = setInterval(() => {
      const identifier = email || nationalId;
      if (identifier) {
        const attemptInfo = getAttemptInfo(identifier);
        if (attemptInfo.lockoutSeconds) {
          setLockoutSeconds(attemptInfo.lockoutSeconds);
        } else {
          setLockoutSeconds(null);
        }
      } else {
        setLockoutSeconds(null);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lockoutSeconds, email, nationalId, getAttemptInfo]);

  const onSubmit = async (data: LoginFormData) => {
    // Check if account is deactivated
    if (isDeactivated) {
      showError('This account has been deactivated due to multiple failed login attempts. Please contact support.');
      return;
    }

    // Check if account is locked out
    if (lockoutSeconds && lockoutSeconds > 0) {
      showError(`Too many failed attempts. Please wait ${lockoutSeconds} seconds before trying again.`);
      return;
    }

    // Validate email format if provided
    if (data.email && currentUniversity) {
      if (!validateUniversityEmail(data.email, currentUniversity.domains)) {
        showError('Invalid email format. Please use a valid university email.');
        return;
      }
    }

    // Validate national ID format if provided
    if (data.nationalId && !validateNationalId(data.nationalId)) {
      showError('Invalid National ID format. Must be 14 digits.');
      return;
    }

    setIsLoading(true);
    try {
      // Use email or nationalId as identifier (at least one is required by schema)
      const loginIdentifier = (data.email?.trim() || data.nationalId?.trim()) as string;
      await login({ identifier: loginIdentifier, password: data.password });
      
      // Reset failed attempts on success
      recordSuccessAttempt(loginIdentifier);
      success(t('auth.otpSent') || 'OTP sent successfully');
      navigate('/otp');
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const errorMessage = axiosError?.response?.data?.message || t('auth.invalidCredentials') || 'Invalid credentials';
      
      // Record failed attempt
      const loginIdentifier = (data.email?.trim() || data.nationalId?.trim()) || '';
      const attemptInfo = recordFailedAttempt(loginIdentifier);
      
      if (attemptInfo.isDeactivated) {
        showError('This account has been deactivated due to multiple failed login attempts. Please contact support.');
        setIsDeactivated(true);
      } else if (attemptInfo.lockoutSeconds) {
        setLockoutSeconds(attemptInfo.lockoutSeconds);
        showError(`Invalid credentials. Too many failed attempts. Please wait ${attemptInfo.lockoutSeconds} seconds before trying again.`);
      } else {
        showError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFormDisabled = isDeactivated || (lockoutSeconds !== null && lockoutSeconds > 0);

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

      <Card className="w-full max-w-lg relative z-10 animate-fade-in-up shadow-xl border border-gray-100 bg-white/95 backdrop-blur-md hover:shadow-2xl hover:bg-white transition-all duration-200 rounded-2xl overflow-hidden">
        {/* Elegant top border */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-500 to-transparent"></div>
        
        <CardHeader className="pb-4">
          <div className="flex justify-center mb-4 animate-scale-in">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-200"></div>
              <img
                src="/logo/logo.png.png"
                alt="University Logo"
                className="h-20 w-20 relative z-10 transition-transform duration-200 group-hover:scale-105 drop-shadow-lg"
              />
            </div>
          </div>
          <CardTitle className="text-center text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent animate-fade-in font-cairo">
            {t('auth.loginTitle') || 'Login to Your Account'}
          </CardTitle>
          <p className="text-center text-sm text-gray-500 mt-2 animate-fade-in">
            Welcome to the University Management System
          </p>
        </CardHeader>
        <CardContent className="pt-2">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email field */}
            <div className="animate-fade-in-up">
              <div className="relative">
                <Input
                  label={t('auth.email') || 'Email'}
                  type="email"
                  placeholder="student@university.edu"
                  error={errors.email?.message}
                  disabled={isFormDisabled}
                  className="transition-all duration-200 hover:shadow-md focus:shadow-lg focus:ring-2 focus:ring-primary-500/30 border-2 py-3 text-base pr-12"
                  {...register('email')}
                />
                <div className="absolute right-3 top-9 text-primary-500 bg-primary-50 p-1.5 rounded-lg">
                  <Mail className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* National ID field */}
            <div className="animate-fade-in-up">
              <div className="relative">
                <Input
                  label={t('auth.nationalId') || 'National ID'}
                  type="text"
                  placeholder="12345678901234"
                  error={errors.nationalId?.message}
                  disabled={isFormDisabled}
                  className="transition-all duration-200 hover:shadow-md focus:shadow-lg focus:ring-2 focus:ring-primary-500/30 border-2 py-3 text-base pr-12"
                  {...register('nationalId')}
                />
                <div className="absolute right-3 top-9 text-primary-500 bg-primary-50 p-1.5 rounded-lg">
                  <CreditCard className="h-4 w-4" />
                </div>
              </div>
            </div>

            {/* Password field */}
            <div className="animate-fade-in-up">
              <div className="relative">
                <Input
                  label={t('auth.password') || 'Password'}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  error={errors.password?.message}
                  disabled={isFormDisabled}
                  className="transition-all duration-200 hover:shadow-md focus:shadow-lg focus:ring-2 focus:ring-primary-500/30 border-2 py-3 text-base pr-24"
                  {...register('password')}
                />
                <div className="absolute right-3 top-9 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isFormDisabled}
                    className="text-gray-400 hover:text-primary-500 transition-colors p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  <div className="text-primary-500 bg-primary-50 p-1.5 rounded-lg">
                    <Lock className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Lockout message */}
            {lockoutSeconds !== null && lockoutSeconds > 0 && (
              <div className="animate-fade-in-up p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 text-center">
                  Too many failed attempts. Please wait <strong>{lockoutSeconds}</strong> seconds before trying again.
                </p>
              </div>
            )}

            {/* Deactivated message */}
            {isDeactivated && (
              <div className="animate-fade-in-up p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 text-center">
                  This account has been deactivated due to multiple failed login attempts. Please contact support.
                </p>
              </div>
            )}

            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors hover:underline"
              >
                {t('auth.forgotPassword') || 'Forgot Password?'}
              </Link>
            </div>

            <div className="animate-fade-in-up pt-2">
              <Button
                type="submit"
                disabled={isFormDisabled}
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3.5 text-base transition-all duration-200 hover:shadow-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                isLoading={isLoading}
              >
                {t('common.login') || 'Login'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
