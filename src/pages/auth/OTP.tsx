import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToastStore } from '@/store/toastStore';
import { useAuthStore } from '@/store/authStore';
import { ArrowLeft } from 'lucide-react';

/** Prefer English UI when the API returns a non-English message */
function toEnglishAuthMessage(message: string | undefined, fallback: string): string {
  if (!message?.trim()) return fallback;
  if (/[\u0600-\u06FF]/.test(message)) return fallback;
  return message;
}

export function OTP() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { success, error: showError } = useToastStore();
  const { loginStepTwo, getPendingLoginEmail, clearPendingLoginEmail } = useAuthStore();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const email = (location.state as { email?: string } | null)?.email ?? getPendingLoginEmail();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();

    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpValue = otp.join('');

    if (otpValue.length !== 6) {
      showError(t('auth.otpIncomplete') || 'Please enter the complete 6-digit code.');
      return;
    }

    if (!email?.trim()) {
      showError(t('auth.otpSessionExpired') || 'Session expired. Please start login again.');
      clearPendingLoginEmail();
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      await loginStepTwo({ email: email.trim(), otp: otpValue });
      success(t('auth.loginSuccess') || 'Login successful');
      navigate('/dashboard');
    } catch (err) {
      const axiosError = err as { response?: { data?: { message?: string } } };
      const raw = axiosError?.response?.data?.message;
      const fallback = t('auth.invalidOTP') || 'Invalid OTP. Please try again.';
      showError(toEnglishAuthMessage(raw, fallback));
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse at top, rgba(10, 36, 114, 0.35) 0%, rgba(0, 17, 57, 0.95) 70%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #ffd700 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-accent-500 rounded-full blur-3xl opacity-[0.12]" />
        <div className="absolute -bottom-32 -left-32 w-[28rem] h-[28rem] bg-accent-500 rounded-full blur-3xl opacity-[0.08]" />
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-primary-400 rounded-full blur-3xl opacity-10" />
      </div>

      <Card className="w-full max-w-lg relative z-10 animate-fade-in-up shadow-2xl border-0 bg-white rounded-2xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-500 via-accent-400 to-accent-500" />

        <CardHeader className="pb-4 pt-8">
          <div className="flex justify-center mb-5 animate-scale-in">
            <div className="relative group">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 blur-md opacity-50 group-hover:opacity-70 transition-opacity duration-300" />
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
            {t('auth.verifyOTP') || 'Verify OTP'}
          </CardTitle>

          <p className="text-center text-base font-semibold mt-2 animate-fade-in" style={{ color: '#0a2472' }}>
            Beni-Suef University
          </p>

          <div className="flex items-center justify-center mt-3 mb-1 animate-fade-in">
            <span className="h-px w-10 bg-accent-400" />
            <span className="mx-2 text-accent-500 text-xs">◆</span>
            <span className="h-px w-10 bg-accent-400" />
          </div>

          <p className="text-center text-xs md:text-sm text-gray-500 mt-1 animate-fade-in px-2">
            {t('auth.otpDescription') || 'Enter the 6-digit code sent to your email'}
          </p>
          {email?.trim() ? (
            <p className="text-center text-sm text-primary-700 font-medium mt-2 break-all px-2 animate-fade-in">
              Code sent to: {email.trim()}
            </p>
          ) : null}
        </CardHeader>

        <CardContent className="pt-2">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-6 gap-2 sm:gap-3 justify-center max-w-md mx-auto animate-fade-in-up">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  autoComplete={index === 0 ? 'one-time-code' : 'off'}
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  disabled={isLoading}
                  className="w-full aspect-square max-w-14 sm:max-w-16 text-center text-xl sm:text-2xl font-bold text-primary-900 border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 transition-all duration-200 hover:border-primary-400 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={t('auth.otpDigitAria', { number: index + 1 }) || `OTP digit ${index + 1}`}
                />
              ))}
            </div>

            <p className="text-center text-xs text-gray-500 animate-fade-in-up px-1">
              {t('auth.otpHelper') || 'You can paste the full code into the first box.'}
            </p>

            <div className="flex items-center justify-center">
              <Link
                to="/login"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors hover:underline flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                {t('auth.backToLogin') || 'Back to Login'}
              </Link>
            </div>

            <div className="animate-fade-in-up pt-2">
              <Button
                type="submit"
                disabled={isLoading || otp.join('').length !== 6}
                className="w-full bg-gradient-to-r from-primary-700 via-primary-600 to-primary-700 hover:from-primary-800 hover:via-primary-700 hover:to-primary-800 text-white font-semibold py-3.5 text-base transition-all duration-300 hover:shadow-xl hover:shadow-primary-900/30 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed border-b-2 border-accent-500"
                isLoading={isLoading}
              >
                {t('auth.verify') || 'Verify'}
              </Button>
            </div>
          </form>

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
