import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { 
  GraduationCap, 
  BookOpen, 
  Users, 
  Award, 
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Wifi,
  Loader2
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://smart-university-api-hzbmh3eph8g5aucq.eastus-01.azurewebsites.net';

export function Landing() {
  const [backendStatus, setBackendStatus] = useState<{ loading: boolean; message?: string; error?: string }>({ loading: false });

  const testBackendConnection = async () => {
    setBackendStatus({ loading: true });
    try {
      const res = await fetch(`${API_BASE}/api/test`);
      const data = await res.json();
      if (res.ok) {
        setBackendStatus({ loading: false, message: data.message ?? 'Backend connected.' });
      } else {
        setBackendStatus({ loading: false, error: data.message || `HTTP ${res.status}` });
      }
    } catch (err) {
      setBackendStatus({
        loading: false,
        error: err instanceof Error ? err.message : 'Could not reach backend.',
      });
    }
  };
  const features = [
    {
      icon: BookOpen,
      title: 'Course Management',
      description: 'Comprehensive management of all courses and subjects',
      color: 'text-primary-500',
      bgColor: 'bg-primary-50',
    },
    {
      icon: Users,
      title: 'Student Management',
      description: 'Complete tracking of student records and academic performance',
      color: 'text-accent-500',
      bgColor: 'bg-accent-50',
    },
    {
      icon: Award,
      title: 'Grades & Assessments',
      description: 'Comprehensive grading system with detailed reports',
      color: 'text-primary-600',
      bgColor: 'bg-primary-50',
    },
    {
      icon: TrendingUp,
      title: 'Reports & Analytics',
      description: 'Detailed reports and comprehensive analytics',
      color: 'text-accent-600',
      bgColor: 'bg-accent-50',
    },
  ];

  const benefits = [
    'User-friendly interface',
    'Multi-language support',
    'High security',
    'Responsive design',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Navigation */}
      <nav className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src="/logo/logo.png.png"
            alt="University Logo"
            className="h-12 w-12"
          />
          <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent font-sans">
            University Management System
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="text-gray-700 hover:text-primary-600 font-medium transition-colors"
          >
            Login
          </Link>
          <Link to="/login">
            <Button className="flex items-center">
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in-up">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary-600 via-primary-500 to-accent-600 bg-clip-text text-transparent font-sans leading-tight">
            Comprehensive University Management System
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed font-sans">
            An integrated solution for managing all aspects of university life from courses and students to assessments and reports
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/login">
              <Button size="lg" className="bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all flex items-center">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="px-8 py-4 text-lg rounded-xl border-2 hover:bg-gray-50 transform hover:scale-105 transition-all"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
          {[
            { number: '10K+', label: 'Students' },
            { number: '500+', label: 'Courses' },
            { number: '100+', label: 'Professors' },
            { number: '50+', label: 'Faculties' },
          ].map((stat, index) => (
            <div
              key={index}
              className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 animate-fade-in-up"
              style={{ animationDelay: `${0.2 + index * 0.1}s` }}
            >
              <div className="text-3xl font-bold text-primary-600 mb-2">{stat.number}</div>
              <div className="text-gray-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4 font-sans">
            Key Features
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto font-sans">
            Everything you need to manage your university efficiently
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 animate-fade-in-up border border-gray-100"
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              >
                <div className={`${feature.bgColor} ${feature.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 font-sans">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed font-sans">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-gradient-to-r from-primary-500 to-accent-500 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-8 font-sans">
              Why Choose Us?
            </h2>
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-left animate-fade-in-up"
                  style={{ animationDelay: `${0.2 + index * 0.1}s` }}
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-accent-300 flex-shrink-0" />
                    <span className="text-lg font-medium font-sans">{benefit}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto bg-gradient-to-r from-primary-500 to-accent-500 rounded-3xl p-12 text-center text-white shadow-2xl animate-fade-in-up">
          <GraduationCap className="h-16 w-16 mx-auto mb-6 opacity-90" />
          <h2 className="text-4xl font-bold mb-4 font-sans">
            Start Your Journey With Us Today
          </h2>
          <p className="text-xl mb-8 opacity-90 font-sans">
            Join thousands of students and professors who trust us
          </p>
          <Link to="/login">
            <Button
              size="lg"
              className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all font-semibold flex items-center justify-center"
            >
              Login Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/logo/logo.png.png"
                  alt="University Logo"
                  className="h-10 w-10"
                />
                <span className="text-xl font-bold font-sans">
                  University Management
                </span>
              </div>
              <p className="text-gray-400 font-sans">
                Comprehensive system for managing all aspects of university life
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-4 font-sans">
                Quick Links
              </h3>
              <ul className="space-y-2 text-gray-400 font-sans">
                <li>
                  <Link to="/login" className="hover:text-white transition-colors">
                    Login
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold mb-4 font-sans">
                Contact Us
              </h3>
              <p className="text-gray-400 font-sans">
                Email: info@university.edu
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400 font-sans space-y-3">
            <p>
              © 2024 University Management System. All rights reserved.
            </p>
            <div className="flex flex-col items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-400 hover:bg-gray-800 hover:text-white"
                onClick={testBackendConnection}
                disabled={backendStatus.loading}
              >
                {backendStatus.loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Wifi className="h-4 w-4 mr-2" />
                    Test backend connection
                  </>
                )}
              </Button>
              {backendStatus.message && (
                <span className="text-green-400 text-sm">✓ {backendStatus.message}</span>
              )}
              {backendStatus.error && (
                <span className="text-red-400 text-sm">✗ {backendStatus.error}</span>
              )}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
