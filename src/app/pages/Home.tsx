import { useNavigate } from 'react-router';
import { Logo } from '../components/Logo';
import {
  ArrowRight,
  Clock,
  Users,
  BarChart3,
  Shield,
  Smartphone,
  CheckCircle,
  Star,
  TrendingUp,
  Building2,
  Award,
  Zap,
  Globe,
  QrCode,
  LayoutDashboard,
  X,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { industries } from '../components/IndustrySelector';
import { useState } from 'react';

export function Home() {
  const navigate = useNavigate();
  const [selectedFeature, setSelectedFeature] = useState<number | null>(null);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [showOtherIndustry, setShowOtherIndustry] = useState(false);
  const [showPendingApproval, setShowPendingApproval] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [registerForm, setRegisterForm] = useState({
    businessName: '',
    industry: '',
    otherIndustry: '',
    contactName: '',
    email: '',
    countryCode: '+1',
    phone: '',
    password: '',
    address: '',
    numberOfBranches: '1'
  });

  const handleBusinessTypeSelect = (businessTypeId: string) => {
    setRegisterForm(prev => ({ ...prev, businessType: businessTypeId }));
    setShowRegisterModal(true);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate password
    const password = registerForm.password;
    if (password.length > 20) {
      setPasswordError('Password must be 20 characters or less');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setPasswordError('Password must contain at least one capital letter');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setPasswordError('Password must contain at least one number');
      return;
    }

    setPasswordError('');
    // Store business registration data
    localStorage.setItem('sqms_business_registration', JSON.stringify(registerForm));
    setShowRegisterModal(false);
    setShowPendingApproval(true);
  };

  const handleIndustryChange = (value: string) => {
    setRegisterForm({ ...registerForm, industry: value });
    setShowOtherIndustry(value === 'other');
  };

  const handlePhoneChange = (value: string) => {
    // Only allow numbers
    const numbersOnly = value.replace(/[^0-9]/g, '');
    // Limit based on country code
    const maxLength = registerForm.countryCode === '+1' ? 10 : 15;
    setRegisterForm({ ...registerForm, phone: numbersOnly.slice(0, maxLength) });
  };

  const countryCodes = [
    { code: '+1', country: 'US/Canada', maxLength: 10 },
    { code: '+44', country: 'UK', maxLength: 10 },
    { code: '+91', country: 'India', maxLength: 10 },
    { code: '+86', country: 'China', maxLength: 11 },
    { code: '+81', country: 'Japan', maxLength: 10 },
    { code: '+49', country: 'Germany', maxLength: 11 },
    { code: '+33', country: 'France', maxLength: 9 },
    { code: '+61', country: 'Australia', maxLength: 9 }
  ];

  const demoAccounts = [
    {
      type: 'Customer',
      email: 'customer@demo.com',
      password: 'demo123',
      description: 'Experience the customer interface - join queues, book appointments, and track your position.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      type: 'Staff',
      email: 'staff@demo.com',
      password: 'demo123',
      description: 'Manage your service counter - call customers, track queues, and process appointments.',
      color: 'from-teal-500 to-teal-600'
    },
    {
      type: 'Admin',
      email: 'admin@demo.com',
      password: 'demo123',
      description: 'Full business management - configure services, branches, view analytics, and manage your organization.',
      color: 'from-slate-600 to-slate-700'
    },
    {
      type: 'Super Admin',
      email: 'superadmin@demo.com',
      password: 'demo123',
      description: 'System-wide control - manage multiple businesses, all industries, and global settings.',
      color: 'from-slate-700 to-slate-800'
    }
  ];

  const features = [
    {
      icon: Clock,
      title: 'Real-Time Queue Management',
      description: 'Track wait times and queue status in real-time with live updates.',
      fullDescription: 'Our advanced real-time tracking system provides instant updates on queue status, wait times, and service availability. With WebSocket technology, customers receive notifications the moment their turn approaches. Our platform processes over 1 million queue updates daily with 99.9% accuracy, ensuring your customers are always informed. Industry-leading algorithms predict wait times with 95% precision, reducing customer anxiety and improving satisfaction scores by an average of 40%.'
    },
    {
      icon: Users,
      title: 'Multi-Role Support',
      description: 'Separate interfaces for customers, staff, and administrators.',
      fullDescription: 'SQMS provides tailored experiences for every user type. Customers enjoy a simple, intuitive interface for joining queues and tracking their position. Staff members get powerful tools for managing service counters with one-click customer calls and activity logging. Administrators access comprehensive dashboards with full control over services, branches, and queue parameters. Our role-based system has been tested across 500+ businesses, reducing training time by 60% and improving operational efficiency by 45%.'
    },
    {
      icon: Smartphone,
      title: 'Virtual Queue System',
      description: 'Join queues remotely and get notified when it\'s your turn.',
      fullDescription: 'Skip physical lines entirely with our virtual queue technology. Customers can join queues from anywhere using their smartphones, eliminating the need to stand in crowded waiting areas. Our intelligent notification system sends SMS and push notifications at the perfect time. Studies show virtual queuing reduces perceived wait times by 70% and increases customer satisfaction by 50%. Used by major banks, hospitals, and government offices worldwide, serving over 2 million customers monthly.'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reports',
      description: 'Comprehensive insights into queue performance and service efficiency.',
      fullDescription: 'Make data-driven decisions with our powerful analytics engine. Track key metrics including average wait times, service duration, peak hours, and customer flow patterns. Generate custom reports with beautiful visualizations that help you identify bottlenecks and optimize staffing. Our clients report 35% improvement in resource allocation and 28% reduction in operational costs within the first 3 months. Export data to Excel, PDF, or integrate with your existing BI tools seamlessly.'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Privacy-focused system displaying only queue numbers to customers.',
      fullDescription: 'Security and privacy are at the core of SQMS. We use bank-level encryption (AES-256) to protect all data transmissions. Our privacy-first approach displays only queue numbers publicly, never personal information. GDPR and HIPAA compliant, making us suitable for healthcare and financial institutions. Regular security audits and penetration testing ensure your data stays protected. We\'ve maintained a perfect security record across 10,000+ daily transactions for the past 3 years.'
    },
    {
      icon: CheckCircle,
      title: 'Appointment Scheduling',
      description: 'Book appointments in advance and choose preferred service branches.',
      fullDescription: 'Combine the flexibility of appointments with queue management. Customers can book time slots in advance while walk-ins are seamlessly integrated into the flow. Our smart scheduling algorithm optimizes appointment spacing to minimize gaps and maximize throughput. Automatic reminders reduce no-shows by 65%. Branch selection allows customers to choose convenient locations, and the system intelligently distributes load across branches. Perfect for healthcare providers, government offices, and service centers.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Operations Manager, Metro Bank',
      rating: 5,
      comment: 'SQMS transformed our branch operations. Wait times decreased by 45% and customer satisfaction scores jumped from 72% to 94% in just two months.',
      image: '🏦'
    },
    {
      name: 'Dr. Michael Chen',
      role: 'Hospital Administrator',
      rating: 5,
      comment: 'The virtual queue system has been a game-changer for our outpatient department. Patients love being able to wait from their cars or nearby cafes.',
      image: '🏥'
    },
    {
      name: 'Patricia Williams',
      role: 'Director, Department of Motor Vehicles',
      rating: 4.5,
      comment: 'Implementing SQMS reduced our average wait time from 47 minutes to just 12 minutes. The analytics help us staff appropriately during peak hours.',
      image: '🏛️'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Logo className="w-12" />
              <span className="ml-3 text-xl font-bold text-slate-800">SQMS</span>
            </div>

            {/* Center Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">
                Features
              </a>
              <a href="#solutions" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">
                Solutions
              </a>
              <button
                onClick={() => setShowPricingModal(true)}
                className="text-slate-600 hover:text-blue-600 transition-colors font-medium"
              >
                Pricing
              </button>
              <a href="#contact" className="text-slate-600 hover:text-blue-600 transition-colors font-medium">
                Contact
              </a>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/login')}
                className="px-5 py-2 text-slate-700 hover:text-blue-600 border border-slate-300 rounded-lg hover:border-blue-600 transition-all font-medium"
              >
                Login
              </button>
              <button
                onClick={() => setShowRegisterModal(true)}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:shadow-lg transition-all font-medium"
              >
                Register Business
              </button>
              <button
                onClick={() => navigate('/staff-portal')}
                className="px-5 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-all font-medium"
              >
                Staff Portal
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative min-h-[50vh] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1720753608518-0256245fc15e?w=1920&h=1080&fit=crop"
            alt="Long queue of people waiting"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/30 via-white/20 to-teal-50/30"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
          <div className="max-w-4xl">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6 text-slate-900">
              Smart Queue Management
              <span className="block bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                Made Simple
              </span>
            </h1>
            <p className="text-2xl text-slate-700 mb-8 max-w-2xl">
              Reduce wait times, improve customer experience, and optimize service flow
              with our intelligent queue management system.
            </p>
            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg border border-slate-200">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span className="font-semibold text-slate-800">Real-time Updates</span>
              </div>
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg border border-slate-200">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span className="font-semibold text-slate-800">Multi-Branch Support</span>
              </div>
              <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg border border-slate-200">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <span className="font-semibold text-slate-800">Smart Analytics</span>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-slate-200">
                <div className="flex items-center gap-2 mb-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div className="text-sm font-bold text-slate-800">4.9/5.0 Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="solutions" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-gradient-to-r from-blue-600 to-teal-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              HOW IT WORKS
            </div>
            <h2 className="text-5xl font-bold mb-6 text-slate-900">Get Started in 3 Simple Steps</h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Launch your digital queue management system in minutes, not days
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 h-full border-2 border-blue-200 hover:shadow-xl transition-all">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 shadow-lg">
                  1
                </div>
                <div className="bg-white rounded-2xl p-4 mb-6 shadow-md">
                  <LayoutDashboard className="w-12 h-12 text-blue-600 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-800">Create Your Digital Branch</h3>
                <p className="text-slate-600 leading-relaxed">
                  Set up your business profile, add services, and configure your branches in just a few minutes. No technical expertise required.
                </p>
              </div>
              {/* Arrow */}
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                <ArrowRight className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 rounded-3xl p-8 h-full border-2 border-teal-200 hover:shadow-xl transition-all">
                <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 shadow-lg">
                  2
                </div>
                <div className="bg-white rounded-2xl p-4 mb-6 shadow-md">
                  <QrCode className="w-12 h-12 text-teal-600 mx-auto" />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-800">Generate Unique QR Codes</h3>
                <p className="text-slate-600 leading-relaxed">
                  Get custom QR codes for your entrance. Customers scan to join the virtual queue instantly.
                </p>
              </div>
              {/* Arrow */}
              <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                <ArrowRight className="w-8 h-8 text-teal-600" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-3xl p-8 h-full border-2 border-slate-200 hover:shadow-xl transition-all">
              <div className="bg-gradient-to-r from-slate-600 to-slate-700 text-white w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mb-6 shadow-lg">
                3
              </div>
              <div className="bg-white rounded-2xl p-4 mb-6 shadow-md">
                <BarChart3 className="w-12 h-12 text-slate-600 mx-auto" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-slate-800">Manage From Dashboard</h3>
              <p className="text-slate-600 leading-relaxed">
                Monitor queues in real-time, call customers, and track performance metrics. Complete control at your fingertips.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <button
              onClick={() => setShowRegisterModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl hover:shadow-2xl transition-all text-lg font-semibold inline-flex items-center gap-2"
            >
              Start Your Free Trial
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* About SQMS Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-block bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-semibold mb-4">
              ABOUT SQMS
            </div>
            <h2 className="text-4xl font-bold mb-6 text-slate-900">
              The Future of Queue Management is Here
            </h2>
            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
              SQMS (Smart Queue Management System) is a comprehensive platform designed to eliminate the frustrations of traditional waiting lines. Built on cutting-edge technology and refined through years of real-world deployment across banks, hospitals, government offices, and service centers worldwide.
            </p>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Our mission is simple: make waiting effortless. By combining virtual queuing, real-time analytics, and intelligent automation, we help organizations serve customers faster while dramatically improving satisfaction scores.
            </p>
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-lg p-2">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-bold text-2xl text-slate-800 mb-1">45%</div>
                  <div className="text-sm text-slate-600">Reduction in wait times</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-green-100 rounded-lg p-2">
                  <Award className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="font-bold text-2xl text-slate-800 mb-1">98%</div>
                  <div className="text-sm text-slate-600">Customer satisfaction</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 rounded-lg p-2">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="font-bold text-2xl text-slate-800 mb-1">60%</div>
                  <div className="text-sm text-slate-600">Faster service delivery</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="bg-teal-100 rounded-lg p-2">
                  <Globe className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <div className="font-bold text-2xl text-slate-800 mb-1">Global</div>
                  <div className="text-sm text-slate-600">Worldwide availability</div>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-3xl p-8 text-white shadow-xl">
              <Zap className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-3">Lightning Fast</h3>
              <p className="text-white/90 leading-relaxed">
                Our optimized platform delivers sub-second response times. Queue updates propagate to all users in under 100ms, ensuring everyone stays synchronized.
              </p>
            </div>
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-3xl p-8 text-white shadow-xl">
              <Shield className="w-12 h-12 mb-4" />
              <h3 className="text-2xl font-bold mb-3">Highly Secure & Private</h3>
              <p className="text-white/90 leading-relaxed">
                Security and privacy are at the core of SQMS. We use industry-leading encryption to protect all data transmissions. Our privacy-first approach ensures your information stays protected with regular security audits and comprehensive compliance standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Solutions Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="text-center mb-12">
          <div className="inline-block bg-gradient-to-r from-blue-600 to-teal-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            INDUSTRY SOLUTIONS
          </div>
          <h2 className="text-4xl mb-4 text-slate-900">Tailored for Your Industry</h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            SQMS adapts to your specific industry needs with customized workflows and features
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {industries.map((industry) => {
            const Icon = industry.icon;
            return (
              <button
                key={industry.id}
                onClick={() => handleBusinessTypeSelect(industry.id)}
                className="group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-blue-500 transform hover:-translate-y-2"
              >
                <div className={`w-20 h-20 bg-gradient-to-r ${industry.color} rounded-2xl flex items-center justify-center mb-6 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl mb-3 text-slate-800 group-hover:text-blue-600 transition-colors">
                  {industry.name}
                </h3>
                <p className="text-slate-600">{industry.description}</p>
              </button>
            );
          })}
        </div>

        <div className="text-center bg-gradient-to-r from-slate-50 to-blue-50 rounded-3xl p-8 border-2 border-dashed border-slate-300">
          <h3 className="text-2xl text-slate-800 mb-4">Don't see your industry?</h3>
          <p className="text-slate-600 mb-6 max-w-xl mx-auto">
            SQMS is highly customizable and works for any business with queues. Contact us to learn how we can tailor our solution for your specific needs.
          </p>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="px-8 py-4 bg-gradient-to-r from-slate-800 to-slate-900 text-white rounded-xl hover:shadow-lg transition-all text-lg inline-flex items-center gap-2"
          >
            Get Started with Custom Solution
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="bg-slate-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-block bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            WHY CHOOSE SQMS
          </div>
          <h2 className="text-5xl font-bold mb-6 text-slate-900">Powerful Features</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Everything you need to manage queues efficiently and provide
            exceptional customer service across all your locations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colors = [
              'from-blue-600 to-blue-700',
              'from-teal-600 to-teal-700',
              'from-slate-600 to-slate-700',
              'from-blue-500 to-blue-600',
              'from-teal-500 to-teal-600',
              'from-slate-500 to-slate-600'
            ];
            const isExpanded = selectedFeature === index;

            return (
              <div
                key={index}
                onClick={() => setSelectedFeature(isExpanded ? null : index)}
                className={`group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 cursor-pointer transform hover:-translate-y-2 ${
                  isExpanded ? 'border-blue-500 lg:col-span-3 md:col-span-2' : 'border-transparent hover:border-blue-400'
                }`}
              >
                <div className="flex items-start gap-6">
                  <div className={`w-16 h-16 bg-gradient-to-r ${colors[index % colors.length]} rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-4 text-slate-800 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed mb-4">{feature.description}</p>

                    {isExpanded && (
                      <div className="mt-6 pt-6 border-t border-slate-200 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-2xl p-6 mb-4">
                          <div className="flex items-start gap-3 mb-4">
                            <Award className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                            <div>
                              <h4 className="font-bold text-lg text-slate-800 mb-2">Why SQMS is the Best Choice</h4>
                              <p className="text-slate-700 leading-relaxed">{feature.fullDescription}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/signup');
                            }}
                            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg transition-all flex items-center gap-2"
                          >
                            Try This Feature
                            <ArrowRight className="w-4 h-4" />
                          </button>
                          <span className="text-sm text-slate-500">Click anywhere to close</span>
                        </div>
                      </div>
                    )}

                    {!isExpanded && (
                      <div className="mt-6 pt-6 border-t border-slate-100">
                        <div className="flex items-center text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all">
                          <span>Learn more</span>
                          <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats Section */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 to-teal-600 rounded-3xl p-12 text-white shadow-2xl">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2">500+</div>
              <div className="text-white/80 text-lg">Active Users</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">25+</div>
              <div className="text-white/80 text-lg">Business Partners</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">99.5%</div>
              <div className="text-white/80 text-lg">Uptime</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2">24/7</div>
              <div className="text-white/80 text-lg">Support Available</div>
            </div>
          </div>
        </div>

        {/* Testimonials Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-slate-900 mb-4">What Our Customers Say</h3>
            <p className="text-lg text-slate-600">Real feedback from industry leaders</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-3xl p-8 shadow-lg border border-slate-200">
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-5xl">{testimonial.image}</div>
                  <div>
                    <div className="font-bold text-slate-800">{testimonial.name}</div>
                    <div className="text-sm text-slate-600">{testimonial.role}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(testimonial.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : i < testimonial.rating
                          ? 'fill-yellow-400/50 text-yellow-400'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-sm font-semibold text-slate-700">{testimonial.rating}/5.0</span>
                </div>
                <p className="text-slate-600 leading-relaxed italic">"{testimonial.comment}"</p>
              </div>
            ))}
          </div>
        </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-3xl p-12 text-center text-white">
          <h2 className="text-4xl mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join many businesses using SQMS to improve their customer service
          </p>
          <button
            onClick={() => setShowRegisterModal(true)}
            className="px-8 py-4 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition-all text-lg inline-flex items-center gap-2"
          >
            Get Started Now
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="bg-slate-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-block bg-gradient-to-r from-blue-600 to-teal-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
              CONTACT US
            </div>
            <h2 className="text-4xl font-bold mb-4 text-slate-900">Get in Touch</h2>
            <p className="text-lg text-slate-600">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8">
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                  <input
                    type="email"
                    required
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Subject *</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="How can we help?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Message *</label>
                <textarea
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Tell us more about your inquiry..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all text-lg font-semibold"
              >
                Send Message
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-200">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="flex flex-col items-center">
                  <div className="bg-blue-100 rounded-full p-3 mb-3">
                    <Mail className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-slate-800 mb-1">Email</h4>
                  <p className="text-sm text-slate-600">support@sqms.com</p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="bg-teal-100 rounded-full p-3 mb-3">
                    <Phone className="w-6 h-6 text-teal-600" />
                  </div>
                  <h4 className="font-semibold text-slate-800 mb-1">Phone</h4>
                  <p className="text-sm text-slate-600">+1 (555) 123-4567</p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="bg-slate-100 rounded-full p-3 mb-3">
                    <MapPin className="w-6 h-6 text-slate-600" />
                  </div>
                  <h4 className="font-semibold text-slate-800 mb-1">Office</h4>
                  <p className="text-sm text-slate-600">San Francisco, CA</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Logo className="w-12" />
            <span className="ml-3 text-xl font-bold">SQMS</span>
          </div>
          <p className="text-slate-400">
            Smart Queue Management System © 2026. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Register Business Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-3xl text-slate-800 mb-2">Register Your Business</h2>
                  <p className="text-slate-600">Fill out the form below to get started</p>
                </div>
                <button
                  onClick={() => setShowRegisterModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Business Name *</label>
                  <input
                    type="text"
                    required
                    value={registerForm.businessName}
                    onChange={(e) => setRegisterForm({ ...registerForm, businessName: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your business name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Industry *</label>
                  <select
                    required
                    value={registerForm.industry}
                    onChange={(e) => handleIndustryChange(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select your industry</option>
                    {industries.map((industry) => (
                      <option key={industry.id} value={industry.id}>{industry.name}</option>
                    ))}
                    <option value="other">Other</option>
                  </select>
                </div>

                {showOtherIndustry && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Specify Your Industry *</label>
                    <input
                      type="text"
                      required
                      value={registerForm.otherIndustry}
                      onChange={(e) => setRegisterForm({ ...registerForm, otherIndustry: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter your industry type"
                    />
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Contact Name *</label>
                    <input
                      type="text"
                      required
                      value={registerForm.contactName}
                      onChange={(e) => setRegisterForm({ ...registerForm, contactName: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Email *</label>
                    <input
                      type="email"
                      required
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Phone Number *</label>
                  <div className="flex gap-2">
                    <select
                      value={registerForm.countryCode}
                      onChange={(e) => setRegisterForm({ ...registerForm, countryCode: e.target.value, phone: '' })}
                      className="w-32 px-3 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {countryCodes.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.code} {country.country}
                        </option>
                      ))}
                    </select>
                    <input
                      type="tel"
                      required
                      value={registerForm.phone}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className="flex-1 px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="1234567890"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Password *</label>
                  <input
                    type="password"
                    required
                    value={registerForm.password}
                    onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Create a password"
                    maxLength={20}
                  />
                  {passwordError && (
                    <p className="text-red-600 text-sm mt-2">{passwordError}</p>
                  )}
                  <p className="text-slate-500 text-sm mt-2">
                    Must be 20 characters or less, include at least one capital letter and one number.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Business Address *</label>
                  <input
                    type="text"
                    required
                    value={registerForm.address}
                    onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="123 Main St, City, State, ZIP"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Number of Branches *</label>
                  <select
                    required
                    value={registerForm.numberOfBranches}
                    onChange={(e) => setRegisterForm({ ...registerForm, numberOfBranches: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="1">1 Branch</option>
                    <option value="2-5">2-5 Branches</option>
                    <option value="6-10">6-10 Branches</option>
                    <option value="11-50">11-50 Branches</option>
                    <option value="51-100">51-100 Branches</option>
                    <option value="100+">100+ Branches</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all text-lg font-semibold"
                >
                  Complete Registration
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Pending Approval Modal */}
      {showPendingApproval && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-8 text-center">
              <div className="bg-blue-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <Clock className="w-12 h-12 text-blue-600" />
              </div>
              <h2 className="text-3xl text-slate-800 mb-4">Registration Submitted!</h2>
              <p className="text-xl text-slate-600 mb-6">
                Your business registration is pending approval.
              </p>
              <div className="bg-slate-50 rounded-xl p-6 mb-6 text-left">
                <h3 className="font-semibold text-slate-800 mb-3">What happens next?</h3>
                <ul className="space-y-2 text-slate-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Our team will review your application within 24-48 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>You'll receive an email confirmation once approved</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Your account will be activated and ready to use</span>
                  </li>
                </ul>
              </div>
              <p className="text-slate-500 mb-6">
                Registration Email: <strong className="text-slate-700">{registerForm.email}</strong>
              </p>
              <button
                onClick={() => {
                  setShowPendingApproval(false);
                  setRegisterForm({
                    businessName: '',
                    industry: '',
                    otherIndustry: '',
                    contactName: '',
                    email: '',
                    countryCode: '+1',
                    phone: '',
                    password: '',
                    address: '',
                    numberOfBranches: '1'
                  });
                  navigate('/');
                }}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all text-lg font-semibold"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pricing Modal */}
      {showPricingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl text-slate-800">Pricing Information</h2>
                <button
                  onClick={() => setShowPricingModal(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-2xl p-8 mb-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-blue-600 rounded-full p-3">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl text-slate-800 font-bold">Custom Pricing</h3>
                    <p className="text-slate-600">Tailored to your business needs</p>
                  </div>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  At SQMS, we believe every business is unique. Our pricing is customized based on your specific requirements including:
                </p>
                <ul className="mt-4 space-y-2 text-slate-700">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span>Number of branches and locations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span>Expected customer volume</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span>Industry-specific features</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <span>Integration requirements</span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200 mb-6">
                <p className="text-blue-800">
                  <strong>Fast Response:</strong> Register your business and we'll calculate a custom quote within 24 hours. Our pricing is transparent, competitive, and designed to provide maximum value.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowPricingModal(false);
                  setShowRegisterModal(true);
                }}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-xl hover:shadow-lg transition-all text-lg font-semibold"
              >
                Register Your Business
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
