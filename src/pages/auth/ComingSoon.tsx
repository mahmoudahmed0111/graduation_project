import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, Clock, ArrowLeft, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToastStore } from '@/store/toastStore';

export function ComingSoon() {
  const { success } = useToastStore();
  const [email, setEmail] = useState('');

  const handleNotifyMe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      success('We\'ll notify you when this feature is available!');
      setEmail('');
    }
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

      <Card className="w-full max-w-2xl relative z-10 animate-fade-in-up shadow-xl border border-gray-100 bg-white/95 backdrop-blur-md hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary-500 to-transparent"></div>
        
        <CardHeader className="pb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-primary-600 transition-colors mb-4 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Back to Home</span>
          </Link>

          <div className="flex justify-center mb-6 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-accent-400 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
              <div className="relative z-10 bg-primary-50 p-6 rounded-2xl">
                <Clock className="h-16 w-16 text-primary-500" />
              </div>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent animate-fade-in font-cairo" style={{ animationDelay: '0.3s' }}>
              Coming Soon
            </h1>
          </div>
          <p className="text-center text-lg text-gray-600 mt-4 animate-fade-in" style={{ animationDelay: '0.35s' }}>
            We're working hard to bring you something amazing!
          </p>
        </CardHeader>

        <CardContent className="pt-2">
          <div className="text-center space-y-6 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <Sparkles className="h-5 w-5 text-primary-500" />
              <p className="text-sm">
                This feature is currently under development and will be available soon.
              </p>
            </div>

            {/* Notify Me Form */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Get Notified
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Enter your email and we'll notify you when this feature is ready.
              </p>
              <form onSubmit={handleNotifyMe} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                  required
                />
                <Button type="submit" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Notify Me
                </Button>
              </form>
            </div>

            {/* Progress Indicator */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Development Progress</span>
                <span className="font-semibold text-primary-600">75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-primary-500 to-accent-500 h-2.5 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: '75%' }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

