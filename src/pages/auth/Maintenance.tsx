import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Wrench, Mail, Clock, RefreshCw } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';

export function Maintenance() {
  const { success } = useToastStore();
  const [email, setEmail] = useState('');

  const handleNotifyMe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      success('We\'ll notify you when maintenance is complete!');
      setEmail('');
    }
  };

  // Mock maintenance end time (2 hours from now)
  const maintenanceEndTime = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
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
        
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-yellow-100 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-orange-100 rounded-full blur-3xl opacity-15"></div>
      </div>

      <Card className="w-full max-w-2xl relative z-10 animate-fade-in-up shadow-xl border border-gray-100 bg-white/95 backdrop-blur-md hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
        
        <CardHeader className="pb-4">
          <div className="flex justify-center mb-6 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
              <div className="relative z-10 bg-yellow-50 p-6 rounded-2xl">
                <Wrench className="h-16 w-16 text-yellow-600" />
              </div>
            </div>
          </div>

          <CardTitle className="text-center text-4xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent animate-fade-in font-cairo" style={{ animationDelay: '0.3s' }}>
            Under Maintenance
          </CardTitle>
          <p className="text-center text-lg text-gray-600 mt-4 animate-fade-in" style={{ animationDelay: '0.35s' }}>
            We're performing scheduled maintenance to improve your experience
          </p>
        </CardHeader>

        <CardContent className="pt-2">
          <div className="text-center space-y-6 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            {/* Maintenance Info */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Clock className="h-5 w-5 text-yellow-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Estimated Completion Time
                </h3>
              </div>
              <p className="text-2xl font-bold text-yellow-700 mb-2">
                {formatTime(maintenanceEndTime)}
              </p>
              <p className="text-sm text-gray-600">
                We apologize for any inconvenience. The system will be back online shortly.
              </p>
            </div>

            {/* What's happening */}
            <div className="text-left space-y-3">
              <h3 className="font-semibold text-gray-900">What we're doing:</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>Updating system infrastructure</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>Applying security patches</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-yellow-600 mt-1">•</span>
                  <span>Optimizing performance</span>
                </li>
              </ul>
            </div>

            {/* Notify Me Form */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Get Notified
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Enter your email and we'll notify you when maintenance is complete.
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

            {/* Refresh Button */}
            <div className="pt-4">
              <Button
                variant="secondary"
                onClick={() => window.location.reload()}
                className="flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Page
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

