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
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  nationalId: z.string().min(14, 'National ID must be 14 digits').max(14, 'National ID must be 14 digits'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { loginStepOne } = useAuthStore();
  const { currentUniversity } = useTenantStore();
  const { success, error: showError } = useToastStore();
  const { recordFailedAttempt, recordSuccessAttempt, getAttemptInfo, resetAttempts } = useLoginAttemptsStore();
  
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
      await loginStepOne({
        email: data.email.trim(),
        nationalID: data.nationalId.trim(),
        password: data.password,
      });

      const loginIdentifier = data.email.trim() || data.nationalId.trim();
      recordSuccessAttempt(loginIdentifier);
      success(t('auth.otpSent') || 'OTP sent successfully');
      navigate('/otp');
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const errorMessage = axiosError?.response?.data?.message || t('auth.invalidCredentials') || 'Invalid credentials';

      const loginIdentifier = data.email?.trim() || data.nationalId?.trim() || '';
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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900">
      {/* Branded university background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Radial navy depth */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at top, rgba(10, 36, 114, 0.35) 0%, rgba(0, 17, 57, 0.95) 70%)',
          }}
        ></div>

        {/* Soft gold ornamental pattern */}
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #ffd700 1px, transparent 0)",
            backgroundSize: '28px 28px',
          }}
        ></div>

        {/* Gold corner accents */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-accent-500 rounded-full blur-3xl opacity-[0.12]"></div>
        <div className="absolute -bottom-32 -left-32 w-[28rem] h-[28rem] bg-accent-500 rounded-full blur-3xl opacity-[0.08]"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-primary-400 rounded-full blur-3xl opacity-10"></div>
      </div>

      <Card className="w-full max-w-lg relative z-10 animate-fade-in-up shadow-2xl border-0 bg-white rounded-2xl overflow-hidden">
        {/* Top gold accent bar — echoes logo identity */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-500 via-accent-400 to-accent-500"></div>

        <CardHeader className="pb-4 pt-8">
          <div className="flex justify-center mb-5 animate-scale-in">
            <div className="relative group">
              {/* Double gold ring — mimics the logo's outer ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 blur-md opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
              <div className="relative p-1 rounded-full bg-gradient-to-br from-accent-400 via-accent-500 to-accent-600 shadow-lg">
                <div className="p-1 rounded-full bg-white">
                  <img
                    src="/logo/logo.png.png"
                    alt="Beni-Suef University Logo"
                    className="h-24 w-24 rounded-full transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              </div>
            </div>
          </div>

          <CardTitle className="text-center text-2xl md:text-3xl font-bold text-primary-800 animate-fade-in">
            {t('auth.loginTitle') || 'Login to Your Account'}
          </CardTitle>

          <p className="text-center text-base font-semibold mt-2 animate-fade-in" style={{ color: '#0a2472' }}>
            Beni-Suef University
          </p>

          {/* Gold separator */}
          <div className="flex items-center justify-center mt-3 mb-1 animate-fade-in">
            <span className="h-px w-10 bg-accent-400"></span>
            <span className="mx-2 text-accent-500 text-xs">◆</span>
            <span className="h-px w-10 bg-accent-400"></span>
          </div>

          <p className="text-center text-xs md:text-sm text-gray-500 mt-1 animate-fade-in">
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
                <div className="absolute right-3 top-9 text-primary-700 bg-gradient-to-br from-accent-50 to-primary-50 p-1.5 rounded-lg border border-accent-200/50">
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
                <div className="absolute right-3 top-9 text-primary-700 bg-gradient-to-br from-accent-50 to-primary-50 p-1.5 rounded-lg border border-accent-200/50">
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
                  <div className="text-primary-700 bg-gradient-to-br from-accent-50 to-primary-50 p-1.5 rounded-lg border border-accent-200/50">
                    <Lock className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </div>

            {/* Lockout message */}
            {lockoutSeconds !== null && lockoutSeconds > 0 && (
              <div className="animate-fade-in-up p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                <p className="text-sm text-blue-800 text-center">
                  Too many failed attempts. Please wait <strong>{lockoutSeconds}</strong> seconds before trying again.
                </p>
                <p className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      const identifier = email || nationalId;
                      if (identifier) {
                        resetAttempts(identifier);
                        setLockoutSeconds(null);
                      }
                    }}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium underline"
                  >
                    Clear lockout and try again
                  </button>
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
                className="w-full bg-gradient-to-r from-primary-700 via-primary-600 to-primary-700 hover:from-primary-800 hover:via-primary-700 hover:to-primary-800 text-white font-semibold py-3.5 text-base transition-all duration-300 hover:shadow-xl hover:shadow-primary-900/30 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed border-b-2 border-accent-500"
                isLoading={isLoading}
              >
                {t('common.login') || 'Login'}
              </Button>
            </div>
          </form>

          {/* Branded footer */}
          <div className="mt-6 pt-4 border-t border-gray-100 text-center animate-fade-in">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()}{' '}
              <span className="text-primary-700 font-semibold">Beni-Suef University</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
