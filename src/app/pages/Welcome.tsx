import { useNavigate } from 'react-router';
import { Logo } from '../components/Logo';
import { 
  ArrowRight, 
  Clock, 
  Smartphone, 
  BarChart3, 
  MapPin, 
  Calendar, 
  CheckCircle,
  Users,
  Zap,
  Bell
} from 'lucide-react';

export function Welcome() {
  const navigate = useNavigate();

  const features = [
    {
      icon: Clock,
      title: 'Reduce Wait Times',
      description: 'Cut customer waiting times by up to 60% with intelligent queue management',
      image: 'https://images.unsplash.com/photo-1563199482-7d05497841d1?w=600'
    },
    {
      icon: Smartphone,
      title: 'Digital Ticketing',
      description: 'Virtual tickets accessible from anywhere - no more physical queues',
      image: 'https://images.unsplash.com/photo-1762769189106-cc314711e4ed?w=600'
    },
    {
      icon: Bell,
      title: 'Real-time Notifications',
      description: 'Keep customers informed with SMS, push, and email alerts',
      image: 'https://images.unsplash.com/photo-1764795849878-59b546cfe9c7?w=600'
    },
    {
      icon: MapPin,
      title: 'Multi-Location Support',
      description: 'Manage queues across multiple branches from one dashboard',
      image: 'https://images.unsplash.com/photo-1556745753-b2904692b3cd?w=600'
    },
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'Book appointments in advance and skip the queue entirely',
      image: 'https://images.unsplash.com/photo-1681505526188-b05e68c77582?w=600'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Insights',
      description: 'Track performance metrics and optimize service delivery',
      image: 'https://images.unsplash.com/photo-1738996747326-65b5d7d7fe9b?w=600'
    }
  ];

  const benefits = [
    { icon: Users, text: 'Serve 40% more customers daily' },
    { icon: Zap, text: 'Reduce operational costs by 30%' },
    { icon: CheckCircle, text: 'Improve customer satisfaction by 75%' },
    { icon: BarChart3, text: 'Real-time performance tracking' }
  ];

  const industries = [
    'Banks & Financial Services',
    'Healthcare & Hospitals',
    'Government Services',
    'Retail Stores',
    'Telecommunications',
    'Service Centers'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-8 flex items-center justify-between">
          <Logo className="w-64" />
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-xl hover:bg-blue-50 transition-all"
          >
            Sign In
          </button>
        </div>

        {/* Hero Content */}
        <div className="py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl md:text-6xl text-slate-800 mb-6 leading-tight">
                Transform Your Customer Experience
              </h1>
              <p className="text-xl text-slate-600 mb-8">
                Smart Queue Management System helps businesses reduce wait times, 
                improve customer satisfaction, and optimize service flow with 
                cutting-edge digital solutions.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-xl transition-all text-lg"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-8 py-4 border-2 border-slate-300 text-slate-700 rounded-xl hover:bg-white hover:border-blue-300 transition-all text-lg"
                >
                  Learn More
                </button>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12">
                <div>
                  <div className="text-4xl text-blue-600 mb-1">500+</div>
                  <div className="text-sm text-slate-600">Businesses</div>
                </div>
                <div>
                  <div className="text-4xl text-blue-600 mb-1">5M+</div>
                  <div className="text-sm text-slate-600">Customers Served</div>
                </div>
                <div>
                  <div className="text-4xl text-blue-600 mb-1">98%</div>
                  <div className="text-sm text-slate-600">Satisfaction</div>
                </div>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-72 h-72 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
                <div className="absolute -bottom-4 -right-4 w-72 h-72 bg-teal-200 rounded-full opacity-20 blur-3xl"></div>
                <img 
                  src="https://images.unsplash.com/photo-1771923082503-0a3381c46cef?w=800" 
                  alt="Smart Queue Management Dashboard"
                  className="relative rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl text-slate-800 mb-4">Why Choose SQMS?</h2>
            <p className="text-xl text-slate-600">Proven results that transform your business</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div key={index} className="bg-gradient-to-br from-blue-50 to-white rounded-2xl p-6 border border-blue-100">
                  <div className="bg-blue-600 rounded-lg p-3 w-12 h-12 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-slate-800">{benefit.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl text-slate-800 mb-4">Powerful Features</h2>
          <p className="text-xl text-slate-600">Everything you need to manage queues efficiently</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all border border-slate-200">
                <img 
                  src={feature.image} 
                  alt={feature.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="bg-teal-100 rounded-lg p-2">
                      <Icon className="w-5 h-5 text-teal-600" />
                    </div>
                    <h3 className="text-xl text-slate-800">{feature.title}</h3>
                  </div>
                  <p className="text-slate-600">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Industries Section */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-700 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl text-white mb-4">Trusted Across Industries</h2>
            <p className="text-xl text-white/90">Serving diverse sectors with tailored solutions</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {industries.map((industry, index) => (
              <div 
                key={index} 
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 text-center text-white hover:bg-white/20 transition-all"
              >
                <CheckCircle className="w-6 h-6 mx-auto mb-2 text-teal-300" />
                {industry}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-3xl shadow-2xl p-12 text-center">
          <h2 className="text-4xl text-white mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join hundreds of businesses already using SQMS to deliver exceptional customer experiences
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-8 py-4 bg-white text-teal-600 rounded-xl hover:bg-teal-50 transition-all text-lg shadow-lg"
            >
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              className="px-8 py-4 border-2 border-white text-white rounded-xl hover:bg-white/10 transition-all text-lg"
            >
              Contact Sales
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <Logo className="w-48 mb-4" />
              <p className="text-slate-400">Transform your customer experience today</p>
            </div>
            <div className="flex gap-8 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition-colors">About Us</a>
              <a href="#" className="hover:text-white transition-colors">Features</a>
              <a href="#" className="hover:text-white transition-colors">Pricing</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
              <a href="#" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm text-slate-400">
            © 2026 Smart Queue Management System. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}