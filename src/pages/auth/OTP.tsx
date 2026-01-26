import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToastStore } from '@/store/toastStore';
import { Shield, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const STATIC_OTP = '123456';

export function OTP() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { success, error: showError } = useToastStore();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
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
      showError('Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      if (otpValue === STATIC_OTP) {
        success('OTP verified successfully');
        navigate('/dashboard');
      } else {
        showError('Invalid OTP. Please try again.');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
      setIsLoading(false);
    }, 500);
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

      <Card className="w-full max-w-lg relative z-10 animate-fade-in-up shadow-xl border border-gray-100 bg-white/95 backdrop-blur-md hover:shadow-2xl hover:bg-white transition-all duration-200 rounded-2xl overflow-hidden">
        {/* Elegant top border */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-500 to-transparent"></div>
        
        <CardHeader className="pb-4">
          <div className="flex justify-center mb-4 animate-scale-in">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-200"></div>
              <div className="h-20 w-20 relative z-10 transition-transform duration-200 group-hover:scale-105 flex items-center justify-center bg-gradient-to-br from-primary-500 to-accent-500 rounded-full">
                <Shield className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
          <CardTitle className="text-center text-3xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent animate-fade-in font-cairo">
            {t('auth.verifyOTP') || 'Verify OTP'}
          </CardTitle>
          <p className="text-center text-sm text-gray-500 mt-2 animate-fade-in">
            {t('auth.otpDescription') || 'Enter the 6-digit code sent to your email'}
          </p>
        </CardHeader>
        <CardContent className="pt-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* OTP Input Fields */}
            <div className="flex justify-center gap-3 animate-fade-in-up">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  disabled={isLoading}
                  className="w-16 h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 transition-all duration-200 hover:border-primary-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={`OTP digit ${index + 1}`}
                />
              ))}
            </div>

            {/* Helper text */}
            <p className="text-center text-sm text-gray-500 animate-fade-in-up">
              {t('auth.otpHelper') || 'For testing, use OTP: 123456'}
            </p>

            {/* Back to login link */}
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
                className="w-full bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3.5 text-base transition-all duration-200 hover:shadow-lg rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                isLoading={isLoading}
              >
                {t('auth.verify') || 'Verify OTP'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
