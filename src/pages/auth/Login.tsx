import { useState, useEffect, ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { validateNationalId, validateUniversityEmail, cn } from '@/lib/utils';
import { useTenantStore } from '@/store/tenantStore';
import { useToastStore } from '@/store/toastStore';
import { useLoginAttemptsStore } from '@/store/loginAttemptsStore';
import { authApi } from '@/lib/api';
import { logger } from '@/lib/logger';
import { Button } from '@/components/ui/Button';
import { Mail, Lock, Eye, EyeOff, CreditCard, ArrowLeft, CheckCircle, type LucideIcon } from 'lucide-react';

// This page is intentionally English + LTR regardless of the app language, so
// all copy below is hard-coded and the root is dir="ltr".

const UNIVERSITY_NAME = 'Beni-Suef University';
const SWAP_EASE = [0.16, 1, 0.3, 1] as const;

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  nationalId: z.string().min(14, 'National ID must be 14 digits').max(14, 'National ID must be 14 digits'),
  password: z.string().min(1, 'Password is required'),
});
type LoginFormData = z.infer<typeof loginSchema>;

const forgotSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  nationalID: z.string().min(14, 'National ID must be 14 digits').max(14, 'National ID must be 14 digits'),
});
type ForgotFormData = z.infer<typeof forgotSchema>;

type Mode = 'login' | 'forgot';

/** A bordered field with the icon rendered INSIDE (flex layout, not absolute),
 *  so it never collides with RTL direction rules or the password toggle. */
function AuthField({
  label,
  icon: Icon,
  error,
  trailing,
  inputProps,
}: {
  label: string;
  icon: LucideIcon;
  error?: string;
  trailing?: ReactNode;
  inputProps: React.ComponentPropsWithRef<'input'>;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300">{label}</label>
      <div
        className={cn(
          'flex items-center gap-2.5 rounded-xl border-2 bg-white px-3 transition-colors',
          'border-gray-200 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500/20',
          'dark:bg-dark-surface dark:border-dark-border dark:focus-within:border-accent-400 dark:focus-within:ring-accent-400/30',
          error && '!border-red-400 focus-within:!ring-red-500/20'
        )}
      >
        <Icon className="h-[18px] w-[18px] shrink-0 text-primary-600 dark:text-accent-300" />
        <span className="h-5 w-px shrink-0 bg-gray-200 dark:bg-dark-border" />
        <input
          {...inputProps}
          className="w-full min-w-0 border-0 bg-transparent py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-0 dark:text-white dark:placeholder:text-slate-500"
          style={{ boxShadow: 'none', backgroundColor: 'transparent' }}
        />
        {trailing}
      </div>
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();

  // In-page mode (login ⇆ forgot) — no route change.
  const [mode, setMode] = useState<Mode>(location.pathname.includes('forgot') ? 'forgot' : 'login');
  const [dir, setDir] = useState(1);
  const go = (m: Mode) => {
    setDir(m === 'forgot' ? 1 : -1);
    setMode(m);
    window.history.replaceState(null, '', m === 'forgot' ? '/forgot-password' : '/login');
  };

  // The brand/form panels swap sides on lg+ only (they stack on mobile).
  const swapped = mode === 'forgot';
  const [isLg, setIsLg] = useState(
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : true
  );
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const onChange = (e: MediaQueryListEvent) => setIsLg(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  const swapActive = isLg && swapped;

  // ─── Login logic ───────────────────────────────────────────────────────
  const { loginStepOne } = useAuthStore();
  const { currentUniversity } = useTenantStore();
  const { success, error: showError } = useToastStore();
  const { recordFailedAttempt, recordSuccessAttempt, getAttemptInfo, resetAttempts } =
    useLoginAttemptsStore();

  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState<number | null>(null);
  const [isDeactivated, setIsDeactivated] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const email = watch('email');
  const nationalId = watch('nationalId');

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

  useEffect(() => {
    if (lockoutSeconds === null || lockoutSeconds <= 0) return;
    const timer = setInterval(() => {
      const identifier = email || nationalId;
      if (identifier) {
        const attemptInfo = getAttemptInfo(identifier);
        setLockoutSeconds(attemptInfo.lockoutSeconds ?? null);
      } else {
        setLockoutSeconds(null);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSeconds, email, nationalId, getAttemptInfo]);

  const onSubmit = async (data: LoginFormData) => {
    if (isDeactivated) {
      showError('This account has been deactivated. Please contact support.');
      return;
    }
    if (lockoutSeconds && lockoutSeconds > 0) {
      showError(`Too many attempts. Please try again in ${lockoutSeconds} seconds.`);
      return;
    }
    if (data.email && currentUniversity) {
      if (!validateUniversityEmail(data.email, currentUniversity.domains)) {
        showError('Please use a valid university email address.');
        return;
      }
    }
    if (data.nationalId && !validateNationalId(data.nationalId)) {
      showError('Please enter a valid 14-digit National ID.');
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
      success('Logged in successfully');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const errorMessage = axiosError?.response?.data?.message || 'Invalid credentials';
      const loginIdentifier = data.email?.trim() || data.nationalId?.trim() || '';
      const attemptInfo = recordFailedAttempt(loginIdentifier);
      if (attemptInfo.isDeactivated) {
        showError('This account has been deactivated. Please contact support.');
        setIsDeactivated(true);
      } else if (attemptInfo.lockoutSeconds) {
        setLockoutSeconds(attemptInfo.lockoutSeconds);
        showError(`Invalid credentials. Too many attempts — try again in ${attemptInfo.lockoutSeconds} seconds.`);
      } else {
        showError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFormDisabled = isDeactivated || (lockoutSeconds !== null && lockoutSeconds > 0);

  // ─── Forgot-password logic ─────────────────────────────────────────────
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const {
    register: registerForgot,
    handleSubmit: handleForgotSubmit,
    formState: { errors: forgotErrors },
  } = useForm<ForgotFormData>({ resolver: zodResolver(forgotSchema) });

  const onForgotSubmit = async (data: ForgotFormData) => {
    setForgotLoading(true);
    try {
      await authApi.forgotPassword({ email: data.email.trim(), nationalID: data.nationalID.trim() });
      setForgotSuccess(true);
      success('A reset link has been sent to your email');
    } catch (error) {
      logger.error('Failed to send reset link', { context: 'Login/forgot', error });
      const axiosError = error as { response?: { data?: { message?: string } } };
      showError(axiosError?.response?.data?.message || 'Error sending reset link');
    } finally {
      setForgotLoading(false);
    }
  };

  // Pure inline-CSS swap (percentages both ways so the transition interpolates
  // cleanly). The root is dir="ltr", so the flex is LTR: brand starts left and
  // slides into the right half; the form starts right and slides into the left
  // half — they swap, always on-screen.
  const panelTransition = 'transform 0.7s cubic-bezier(0.16, 1, 0.3, 1)';

  const brandPanel = (
    <div
      style={{ transform: swapActive ? 'translateX(100%)' : 'translateX(0%)', transition: panelTransition }}
      className="relative z-20 hidden w-1/2 overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 shadow-xl shadow-primary-950/40 will-change-transform lg:flex lg:flex-col lg:items-center lg:justify-center"
    >
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #ffd700 1px, transparent 0)',
          backgroundSize: '26px 26px',
        }}
      />
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-accent-500/20 blur-3xl" />
      <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-accent-500/10 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center px-10 text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 blur-md opacity-50" />
          <div className="relative rounded-full bg-gradient-to-br from-accent-400 via-accent-500 to-accent-600 p-1 shadow-2xl">
            <div className="rounded-full bg-white p-1.5">
              <img
                src="/logo/logo.png.png"
                alt={`${UNIVERSITY_NAME} logo`}
                className="h-28 w-28 rounded-full object-cover"
              />
            </div>
          </div>
        </div>
        <h2 className="font-display text-2xl font-bold text-white">{UNIVERSITY_NAME}</h2>
        <div className="my-4 flex items-center justify-center">
          <span className="h-px w-10 bg-accent-400/70" />
          <span className="mx-2 text-xs text-accent-400">◆</span>
          <span className="h-px w-10 bg-accent-400/70" />
        </div>
        <p className="max-w-xs text-sm leading-relaxed text-primary-200">
          Welcome to the University Management System
        </p>
      </div>
    </div>
  );

  const formPanel = (
    <div
      style={{ transform: swapActive ? 'translateX(-100%)' : 'translateX(0%)', transition: panelTransition }}
      className="relative z-10 flex w-full items-center justify-center overflow-hidden p-7 will-change-transform sm:p-10 lg:w-1/2"
    >
      <div className="w-full max-w-sm">
        {/* Mobile logo */}
        <div className="mb-6 flex justify-center lg:hidden">
          <div className="rounded-full bg-gradient-to-br from-accent-400 via-accent-500 to-accent-600 p-1 shadow-lg">
            <div className="rounded-full bg-white p-1">
              <img
                src="/logo/logo.png.png"
                alt={`${UNIVERSITY_NAME} logo`}
                className="h-16 w-16 rounded-full object-cover"
              />
            </div>
          </div>
        </div>

        <motion.div
          key={mode}
          initial={{ opacity: 0, x: dir * 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.45, ease: SWAP_EASE }}
        >
          {mode === 'login' ? (
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight text-primary-800 dark:text-white md:text-3xl">
                Login to Your Account
              </h1>
              <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400">
                Welcome to the University Management System
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                <AuthField
                  label="Email"
                  icon={Mail}
                  error={errors.email?.message}
                  inputProps={{
                    type: 'email',
                    placeholder: 'student@university.edu',
                    autoComplete: 'email',
                    disabled: isFormDisabled,
                    ...register('email'),
                  }}
                />

                <AuthField
                  label="National ID"
                  icon={CreditCard}
                  error={errors.nationalId?.message}
                  inputProps={{
                    type: 'text',
                    placeholder: '12345678901234',
                    disabled: isFormDisabled,
                    ...register('nationalId'),
                  }}
                />

                <AuthField
                  label="Password"
                  icon={Lock}
                  error={errors.password?.message}
                  inputProps={{
                    type: showPassword ? 'text' : 'password',
                    placeholder: '••••••••',
                    autoComplete: 'current-password',
                    disabled: isFormDisabled,
                    ...register('password'),
                  }}
                  trailing={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isFormDisabled}
                      className="shrink-0 rounded-lg p-1 text-gray-400 transition-colors hover:text-primary-600 disabled:opacity-50 dark:hover:text-accent-300"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                    </button>
                  }
                />

                {lockoutSeconds !== null && lockoutSeconds > 0 && (
                  <div className="space-y-2 rounded-xl border border-blue-200 bg-blue-50 p-3 dark:border-dark-border dark:bg-primary-900/30">
                    <p className="text-center text-sm text-blue-800 dark:text-blue-200">
                      Too many attempts. Please try again in <strong>{lockoutSeconds}</strong> seconds.
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
                        className="text-sm font-medium text-primary-600 underline hover:text-primary-700"
                      >
                        Clear lockout
                      </button>
                    </p>
                  </div>
                )}

                {isDeactivated && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-dark-border dark:bg-red-500/10">
                    <p className="text-center text-sm text-red-800 dark:text-red-300">
                      This account has been deactivated. Please contact support.
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => go('forgot')}
                    className="text-sm font-semibold text-primary-600 transition-colors hover:text-primary-700 hover:underline dark:text-accent-300"
                  >
                    Forgot Password?
                  </button>
                </div>

                <Button
                  type="submit"
                  disabled={isFormDisabled}
                  isLoading={isLoading}
                  className="w-full rounded-xl border-b-2 border-accent-500 bg-gradient-to-r from-primary-700 via-primary-600 to-primary-700 py-3.5 text-base font-semibold text-white transition-all duration-300 hover:from-primary-800 hover:via-primary-700 hover:to-primary-800 hover:shadow-xl hover:shadow-primary-900/30 disabled:opacity-50"
                >
                  Login
                </Button>
              </form>
            </div>
          ) : (
            <div>
              {forgotSuccess ? (
                <div className="py-6 text-center">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 dark:bg-emerald-500/15">
                    <CheckCircle className="h-8 w-8 text-emerald-600 dark:text-emerald-300" />
                  </div>
                  <h3 className="font-display text-xl font-bold text-gray-900 dark:text-white">Success</h3>
                  <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400">
                    A reset link has been sent to your email.
                  </p>
                  <Button
                    onClick={() => {
                      setForgotSuccess(false);
                      go('login');
                    }}
                    className="mt-6 w-full rounded-xl bg-gradient-to-r from-primary-700 to-primary-600 py-3 font-semibold text-white"
                  >
                    Back to Login
                  </Button>
                </div>
              ) : (
                <>
                  <h1 className="font-display text-2xl font-bold tracking-tight text-primary-800 dark:text-white md:text-3xl">
                    Reset Your Password
                  </h1>
                  <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400">
                    Enter your email and National ID to receive a reset link.
                  </p>

                  <form onSubmit={handleForgotSubmit(onForgotSubmit)} className="mt-6 space-y-4">
                    <AuthField
                      label="Email"
                      icon={Mail}
                      error={forgotErrors.email?.message}
                      inputProps={{
                        type: 'email',
                        placeholder: 'student@university.edu',
                        autoComplete: 'email',
                        ...registerForgot('email'),
                      }}
                    />

                    <AuthField
                      label="National ID"
                      icon={CreditCard}
                      error={forgotErrors.nationalID?.message}
                      inputProps={{
                        type: 'text',
                        placeholder: '12345678901234',
                        ...registerForgot('nationalID'),
                      }}
                    />

                    <Button
                      type="submit"
                      isLoading={forgotLoading}
                      className="w-full rounded-xl border-b-2 border-accent-500 bg-gradient-to-r from-primary-700 via-primary-600 to-primary-700 py-3.5 text-base font-semibold text-white transition-all duration-300 hover:from-primary-800 hover:via-primary-700 hover:to-primary-800 hover:shadow-xl hover:shadow-primary-900/30"
                    >
                      Send Reset Link
                    </Button>

                    <button
                      type="button"
                      onClick={() => go('login')}
                      className="mx-auto flex items-center gap-2 text-sm font-semibold text-gray-500 transition-colors hover:text-primary-600 dark:text-slate-400 dark:hover:text-accent-300"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Login
                    </button>
                  </form>
                </>
              )}
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <div className="mt-8 border-t border-gray-100 pt-4 text-center dark:border-dark-border">
          <p className="text-xs text-gray-400 dark:text-slate-500">
            © {new Date().getFullYear()}{' '}
            <span className="font-semibold text-primary-700 dark:text-accent-300">{UNIVERSITY_NAME}</span>
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div
      dir="ltr"
      className="min-h-screen w-full bg-gradient-to-br from-primary-950 via-primary-900 to-primary-950 p-4 sm:p-6 lg:p-8 flex items-center justify-center"
    >
      <div className="mx-auto w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-elevated ring-1 ring-black/5 dark:bg-dark-surface dark:ring-dark-border">
        {/* Brand panel is first (left) and slides right; form is second (right)
            and slides left — together they swap sides on toggle. */}
        <div className="flex min-h-[600px]">
          {brandPanel}
          {formPanel}
        </div>
      </div>
    </div>
  );
}
