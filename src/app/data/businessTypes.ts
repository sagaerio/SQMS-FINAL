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
  // Banking Branches
  { id: 'banking-1', name: 'First National Bank - Downtown', address: '123 Financial District, Manhattan, NY 10005', phone: '+1 (212) 555-0100', hours: '9:00 AM - 6:00 PM', businessType: 'banking' },
  { id: 'banking-2', name: 'First National Bank - Midtown', address: '456 Park Avenue, New York, NY 10022', phone: '+1 (212) 555-0200', hours: '9:00 AM - 6:00 PM', businessType: 'banking' },
  { id: 'banking-3', name: 'First National Bank - Brooklyn', address: '789 Atlantic Avenue, Brooklyn, NY 11217', phone: '+1 (718) 555-0300', hours: '9:00 AM - 5:00 PM', businessType: 'banking' },
  { id: 'banking-4', name: 'First National Bank - Queens', address: '321 Main Street, Flushing, NY 11354', phone: '+1 (718) 555-0400', hours: '9:00 AM - 5:00 PM', businessType: 'banking' },

  // Healthcare Branches
  { id: 'healthcare-1', name: 'City General Hospital - Main Campus', address: '100 Medical Plaza, New York, NY 10016', phone: '+1 (212) 555-1000', hours: '24/7 Emergency', businessType: 'healthcare' },
  { id: 'healthcare-2', name: 'City General Hospital - North Clinic', address: '250 Health Avenue, Bronx, NY 10461', phone: '+1 (718) 555-1100', hours: '7:00 AM - 10:00 PM', businessType: 'healthcare' },
  { id: 'healthcare-3', name: 'City General Hospital - East Center', address: '500 Wellness Drive, Queens, NY 11365', phone: '+1 (718) 555-1200', hours: '8:00 AM - 8:00 PM', businessType: 'healthcare' },
  { id: 'healthcare-4', name: 'City General Hospital - Community Clinic', address: '75 Care Street, Brooklyn, NY 11201', phone: '+1 (718) 555-1300', hours: '8:00 AM - 6:00 PM', businessType: 'healthcare' },

  // Retail Branches
  { id: 'retail-1', name: 'MegaStore - Manhattan Plaza', address: '200 Shopping Center, New York, NY 10001', phone: '+1 (212) 555-4000', hours: '10:00 AM - 9:00 PM', businessType: 'retail' },
  { id: 'retail-2', name: 'MegaStore - Brooklyn Mall', address: '350 Retail Avenue, Brooklyn, NY 11220', phone: '+1 (718) 555-4100', hours: '10:00 AM - 8:00 PM', businessType: 'retail' },
  { id: 'retail-3', name: 'MegaStore - Queens Center', address: '450 Commerce Drive, Queens, NY 11373', phone: '+1 (718) 555-4200', hours: '9:00 AM - 9:00 PM', businessType: 'retail' },

  // Government Offices
  { id: 'government-1', name: 'Department of Motor Vehicles - Manhattan', address: '11 Greenwich Street, New York, NY 10004', phone: '+1 (212) 555-2000', hours: '8:30 AM - 4:30 PM', businessType: 'government' },
  { id: 'government-2', name: 'City Hall Services Center', address: '1 City Hall Plaza, New York, NY 10007', phone: '+1 (212) 555-2100', hours: '9:00 AM - 5:00 PM', businessType: 'government' },
  { id: 'government-3', name: 'Social Services Office - Brooklyn', address: '350 Jay Street, Brooklyn, NY 11201', phone: '+1 (718) 555-2200', hours: '9:00 AM - 5:00 PM', businessType: 'government' },
  { id: 'government-4', name: 'Tax Assessment Office', address: '66 John Street, New York, NY 10038', phone: '+1 (212) 555-2300', hours: '9:00 AM - 4:00 PM', businessType: 'government' },

  // Education Branches
  { id: 'education-1', name: 'State University - Main Campus', address: '1 University Plaza, New York, NY 10003', phone: '+1 (212) 555-5000', hours: '8:00 AM - 6:00 PM', businessType: 'education' },
  { id: 'education-2', name: 'State University - Admissions Office', address: '50 Student Center, New York, NY 10003', phone: '+1 (212) 555-5100', hours: '9:00 AM - 5:00 PM', businessType: 'education' },
  { id: 'education-3', name: 'Community College - Brooklyn Campus', address: '300 Education Way, Brooklyn, NY 11210', phone: '+1 (718) 555-5200', hours: '8:00 AM - 7:00 PM', businessType: 'education' },

  // Corporate Branches
  { id: 'corporate-1', name: 'TechCorp Headquarters - Floor 5 HR', address: '500 Corporate Plaza, New York, NY 10017', phone: '+1 (212) 555-6000', hours: '9:00 AM - 6:00 PM', businessType: 'corporate' },
  { id: 'corporate-2', name: 'TechCorp - IT Help Desk', address: '500 Corporate Plaza, Floor 2, New York, NY 10017', phone: '+1 (212) 555-6100', hours: '8:00 AM - 8:00 PM', businessType: 'corporate' },
  { id: 'corporate-3', name: 'TechCorp - Brooklyn Office', address: '100 Business Park, Brooklyn, NY 11201', phone: '+1 (718) 555-6200', hours: '9:00 AM - 6:00 PM', businessType: 'corporate' },

];

// Helper function to get branches by industry (handles both old and new naming)
export function getBranchesByIndustry(industryId: string): Branch[] {
  return branches.filter(b => b.businessType === industryId);
}
