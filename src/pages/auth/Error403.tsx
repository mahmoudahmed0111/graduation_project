import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Shield, ArrowLeft, Home, AlertTriangle } from 'lucide-react';

export function Error403() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-gray-50 to-gray-100/50 p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `linear-gradient(to right, #0055cc 1px, transparent 1px),
                           linear-gradient(to bottom, #0055cc 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}></div>
        
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-red-100 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 bg-orange-100 rounded-full blur-3xl opacity-15"></div>
      </div>

      <Card className="w-full max-w-lg relative z-10 animate-fade-in-up shadow-xl border border-gray-100 bg-white/95 backdrop-blur-md hover:shadow-2xl transition-all duration-300 rounded-2xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
        
        <CardHeader className="pb-4">
          <div className="flex justify-center mb-6 animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-orange-400 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
              <div className="relative z-10 bg-red-50 p-6 rounded-2xl">
                <Shield className="h-16 w-16 text-red-500" />
              </div>
            </div>
          </div>

          <CardTitle className="text-center text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent animate-fade-in font-cairo" style={{ animationDelay: '0.3s' }}>
            403
          </CardTitle>
          <p className="text-center text-2xl font-semibold text-gray-900 mt-2 animate-fade-in" style={{ animationDelay: '0.35s' }}>
            Access Forbidden
          </p>
        </CardHeader>

        <CardContent className="pt-2">
          <div className="text-center space-y-6 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="text-left">
                <p className="text-sm font-medium text-red-900 mb-1">
                  You don't have permission to access this resource
                </p>
                <p className="text-xs text-red-700">
                  If you believe this is an error, please contact your administrator.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-gray-600">
                The page or resource you're trying to access requires special permissions that your account doesn't have.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <Link to="/">
                <Button variant="primary" className="w-full sm:w-auto flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Go to Home
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" className="w-full sm:w-auto flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Login
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

