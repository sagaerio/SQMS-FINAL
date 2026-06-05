export interface BusinessType {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  gradient: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  estimatedTime: string;
  icon: string;
  businessType: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  businessType: string;
}

export const businessTypes: BusinessType[] = [
  {
    id: 'bank',
    name: 'Banks',
    icon: '🏦',
    description: 'Financial services and banking operations',
    color: 'blue',
    gradient: 'from-blue-600 to-blue-700'
  },
  {
    id: 'hospital',
    name: 'Hospitals',
    icon: '🏥',
    description: 'Healthcare and medical services',
    color: 'red',
    gradient: 'from-red-600 to-red-700'
  },
  {
    id: 'government',
    name: 'Government Offices',
    icon: '🏛️',
    description: 'Public services and administration',
    color: 'purple',
    gradient: 'from-purple-600 to-purple-700'
  },
  {
    id: 'service',
    name: 'Service Centers',
    icon: '🏢',
    description: 'Customer service and support centers',
    color: 'teal',
    gradient: 'from-teal-600 to-teal-700'
  }
];

export const services: Service[] = [
  // Bank Services
  { id: 'bank-1', name: 'Account Opening', description: 'Open new savings or checking accounts', estimatedTime: '15-20 min', icon: '👤', businessType: 'bank' },
  { id: 'bank-2', name: 'Loan Application', description: 'Apply for personal or business loans', estimatedTime: '30-45 min', icon: '💰', businessType: 'bank' },
  { id: 'bank-3', name: 'Credit Card Services', description: 'Credit card applications and support', estimatedTime: '10-15 min', icon: '💳', businessType: 'bank' },
  { id: 'bank-4', name: 'Investment Consultation', description: 'Financial planning and investment advice', estimatedTime: '45-60 min', icon: '📈', businessType: 'bank' },
  { id: 'bank-5', name: 'Wire Transfer', description: 'Domestic and international money transfers', estimatedTime: '10-15 min', icon: '💸', businessType: 'bank' },
  { id: 'bank-6', name: 'Mortgage Services', description: 'Home loan applications and consultations', estimatedTime: '30-45 min', icon: '🏠', businessType: 'bank' },

  // Hospital Services
  { id: 'hospital-1', name: 'General Consultation', description: 'Routine check-ups with general practitioners', estimatedTime: '20-30 min', icon: '👨‍⚕️', businessType: 'hospital' },
  { id: 'hospital-2', name: 'Emergency Care', description: 'Urgent medical attention and treatment', estimatedTime: 'Immediate', icon: '🚨', businessType: 'hospital' },
  { id: 'hospital-3', name: 'Laboratory Tests', description: 'Blood tests and diagnostic procedures', estimatedTime: '15-25 min', icon: '🔬', businessType: 'hospital' },
  { id: 'hospital-4', name: 'Radiology', description: 'X-rays, MRI, and CT scan services', estimatedTime: '30-45 min', icon: '📷', businessType: 'hospital' },
  { id: 'hospital-5', name: 'Pharmacy', description: 'Prescription pickup and medication counseling', estimatedTime: '10-15 min', icon: '💊', businessType: 'hospital' },
  { id: 'hospital-6', name: 'Vaccination', description: 'Immunizations and vaccine administration', estimatedTime: '15-20 min', icon: '💉', businessType: 'hospital' },

  // Government Services
  { id: 'gov-1', name: 'ID Card Renewal', description: 'National ID card applications and renewals', estimatedTime: '20-30 min', icon: '🪪', businessType: 'government' },
  { id: 'gov-2', name: 'Passport Services', description: 'Passport applications and renewals', estimatedTime: '30-45 min', icon: '🛂', businessType: 'government' },
  { id: 'gov-3', name: 'Tax Services', description: 'Tax filing and consultation services', estimatedTime: '25-40 min', icon: '📋', businessType: 'government' },
  { id: 'gov-4', name: "Driver's License", description: 'License applications and renewals', estimatedTime: '30-45 min', icon: '🚗', businessType: 'government' },
  { id: 'gov-5', name: 'Business Permits', description: 'Business registration and licensing', estimatedTime: '40-60 min', icon: '📄', businessType: 'government' },
  { id: 'gov-6', name: 'Civil Registry', description: 'Birth, marriage, and death certificates', estimatedTime: '20-30 min', icon: '📜', businessType: 'government' },

  // Service Center Services
  { id: 'service-1', name: 'Customer Support', description: 'General inquiries and assistance', estimatedTime: '15-20 min', icon: '💬', businessType: 'service' },
  { id: 'service-2', name: 'Technical Support', description: 'IT and technical troubleshooting', estimatedTime: '25-40 min', icon: '🔧', businessType: 'service' },
  { id: 'service-3', name: 'Product Returns', description: 'Return and exchange services', estimatedTime: '10-15 min', icon: '↩️', businessType: 'service' },
  { id: 'service-4', name: 'Bill Payment', description: 'Utility and service bill payments', estimatedTime: '5-10 min', icon: '💵', businessType: 'service' },
  { id: 'service-5', name: 'Account Management', description: 'Account updates and modifications', estimatedTime: '15-25 min', icon: '⚙️', businessType: 'service' },
  { id: 'service-6', name: 'Document Verification', description: 'Verify and process documents', estimatedTime: '20-30 min', icon: '✅', businessType: 'service' },
];

export const branches: Branch[] = [
  // Banking
  { id: 'banking-1', name: 'Brooklyn Service Hub',        address: '456 Atlantic Ave, Brooklyn',        phone: '+1 (718) 555-0100', hours: '9:00 AM – 5:00 PM', businessType: 'banking' },
  { id: 'banking-2', name: 'Manhattan Financial Center',  address: '123 Wall St, New York',              phone: '+1 (212) 555-0200', hours: '9:00 AM – 6:00 PM', businessType: 'banking' },
  { id: 'banking-3', name: 'Queens Branch',               address: '789 Queens Blvd, Queens',            phone: '+1 (718) 555-0300', hours: '9:00 AM – 5:00 PM', businessType: 'banking' },

  // Corporate
  { id: 'corporate-1', name: 'East Hub',              address: '88 East Business Park',         phone: '+1 (212) 555-6100', hours: '8:00 AM – 6:00 PM', businessType: 'corporate' },
  { id: 'corporate-2', name: 'HQ Tower A – Floor 12', address: '1 Corporate Blvd, CBD',         phone: '+1 (212) 555-6200', hours: '9:00 AM – 6:00 PM', businessType: 'corporate' },
  { id: 'corporate-3', name: 'West Office Park',      address: '33 Business Park, West',        phone: '+1 (212) 555-6300', hours: '9:00 AM – 5:00 PM', businessType: 'corporate' },

  // Education
  { id: 'education-1', name: 'City Learning Centre',       address: '12 City Rd, Downtown',          phone: '+1 (212) 555-5100', hours: '8:00 AM – 6:00 PM', businessType: 'education' },
  { id: 'education-2', name: 'East Campus',                address: 'East Wing, Campus B',           phone: '+1 (212) 555-5200', hours: '8:00 AM – 5:00 PM', businessType: 'education' },
  { id: 'education-3', name: 'Main Campus – Admin Block',  address: 'Building A, Main Campus',       phone: '+1 (212) 555-5300', hours: '9:00 AM – 5:00 PM', businessType: 'education' },

  // Government
  { id: 'government-1', name: 'City Hall – Main Office',  address: '1 Civic Square, Downtown',    phone: '+1 (212) 555-2100', hours: '9:00 AM – 5:00 PM', businessType: 'government' },
  { id: 'government-2', name: 'North District Office',    address: '44 North Ave, Northgate',     phone: '+1 (212) 555-2200', hours: '8:30 AM – 4:30 PM', businessType: 'government' },
  { id: 'government-3', name: 'South Service Centre',     address: '77 South Rd, Southville',     phone: '+1 (212) 555-2300', hours: '9:00 AM – 5:00 PM', businessType: 'government' },

  // Healthcare
  { id: 'healthcare-1', name: 'Eastside Medical Center',  address: '88 Eastside Rd, East',         phone: '+1 (212) 555-1100', hours: '7:00 AM – 8:00 PM', businessType: 'healthcare' },
  { id: 'healthcare-2', name: 'Main Hospital – Downtown', address: '10 Medical Blvd, Downtown',    phone: '+1 (212) 555-1200', hours: '24/7',               businessType: 'healthcare' },
  { id: 'healthcare-3', name: 'Northside Clinic',         address: '22 Health Ave, Northside',     phone: '+1 (212) 555-1300', hours: '8:00 AM – 6:00 PM', businessType: 'healthcare' },

  // Retail
  { id: 'retail-1', name: 'Flagship Store – Downtown', address: '1 Retail Plaza, Downtown',   phone: '+1 (212) 555-4100', hours: '10:00 AM – 9:00 PM', businessType: 'retail' },
  { id: 'retail-2', name: 'Mall Branch',               address: 'Level 2, Central Mall',      phone: '+1 (212) 555-4200', hours: '10:00 AM – 8:00 PM', businessType: 'retail' },
  { id: 'retail-3', name: 'Westside Outlet',           address: '55 West Rd, Westside',       phone: '+1 (212) 555-4300', hours: '9:00 AM – 9:00 PM',  businessType: 'retail' },
];

// Helper function to get branches by industry (handles both old and new naming)
export function getBranchesByIndustry(industryId: string): Branch[] {
  return branches.filter(b => b.businessType === industryId);
}
