export const industryServices = {
  banking: [
    { id: 1, name: 'Account Opening',    description: 'Open a new savings or checking account',       duration: '30 min', category: 'Account Services' },
    { id: 2, name: 'Card Services',       description: 'Credit and debit card applications',            duration: '20 min', category: 'Card Services'    },
    { id: 3, name: 'Customer Service',    description: 'General banking enquiries and assistance',      duration: '10 min', category: 'Customer Support' },
    { id: 4, name: 'Loan Consultation',   description: 'Personal and business loan consultation',       duration: '45 min', category: 'Loan Services'    },
    { id: 5, name: 'Teller Services',     description: 'Cash deposits, withdrawals and transfers',      duration: '10 min', category: 'Teller Services'  },
  ],
  corporate: [
    { id: 1, name: 'Facilities',  description: 'Building maintenance and facilities requests', duration: '10 min', category: 'Facilities Management' },
    { id: 2, name: 'HR Services', description: 'HR inquiries and employee services',           duration: '20 min', category: 'HR Services'           },
    { id: 3, name: 'IT Support',  description: 'Technical support for hardware and software',  duration: '15 min', category: 'IT Services'           },
    { id: 4, name: 'Reception',   description: 'Visitor registration and general reception',   duration: '5 min',  category: 'Reception'             },
  ],
  education: [
    { id: 1, name: 'Admissions',       description: 'New student enrollment consultation',      duration: '20 min', category: 'Admissions'           },
    { id: 2, name: 'Financial Aid',    description: 'Student financial aid consultation',        duration: '30 min', category: 'Financial Services'   },
    { id: 3, name: 'Library Services', description: 'Library access, books and resources',      duration: '5 min',  category: 'Library Services'     },
    { id: 4, name: 'Registrar',        description: 'Course registration and academic records', duration: '15 min', category: 'Registration Services'},
  ],
  government: [
    { id: 1, name: 'Document Processing',  description: 'Processing of official documents and forms',  duration: '40 min', category: 'Documentation'    },
    { id: 2, name: 'General Inquiries',    description: 'General questions about public services',      duration: '15 min', category: 'Information'      },
    { id: 3, name: 'ID / Passport Renewal',description: 'Renew national ID or passport',               duration: '45 min', category: 'Identity Services'},
    { id: 4, name: 'Permits & Licenses',   description: 'Apply for business or building permits',       duration: '35 min', category: 'Permit Services'  },
  ],
  healthcare: [
    { id: 1, name: 'Blood Test / Lab',   description: 'Blood tests and diagnostic lab services',     duration: '20 min', category: 'Diagnostic Services' },
    { id: 2, name: 'Dental',             description: 'Dental checkup and treatment',                duration: '25 min', category: 'Dental Services'     },
    { id: 3, name: 'General Practitioner',description: 'Routine consultation with a GP',             duration: '30 min', category: 'Medical Services'    },
    { id: 4, name: 'Pharmacy Pickup',    description: 'Prescription collection and dispensing',      duration: '5 min',  category: 'Pharmacy Services'   },
    { id: 5, name: 'Specialist Consult', description: 'Consultation with a medical specialist',      duration: '40 min', category: 'Medical Services'    },
  ],
  retail: [
    { id: 1, name: 'Click & Collect',      description: 'Collect your online order in-store',         duration: '5 min',  category: 'Order Services'      },
    { id: 2, name: 'Customer Service',     description: 'General customer service and enquiries',      duration: '8 min',  category: 'Customer Support'    },
    { id: 3, name: 'Returns & Exchanges',  description: 'Return or exchange purchased items',          duration: '12 min', category: 'Returns & Exchanges' },
    { id: 4, name: 'Tech Support',         description: 'Technical help with electronics and devices', duration: '25 min', category: 'Tech Support'        },
  ],
};

export const industryBranches = {
  banking: [
    'Brooklyn Service Hub',
    'Manhattan Financial Center',
    'Queens Branch',
  ],
  corporate: [
    'East Hub',
    'HQ Tower A – Floor 12',
    'West Office Park',
  ],
  education: [
    'City Learning Centre',
    'East Campus',
    'Main Campus – Admin Block',
  ],
  government: [
    'City Hall – Main Office',
    'North District Office',
    'South Service Centre',
  ],
  healthcare: [
    'Eastside Medical Center',
    'Main Hospital – Downtown',
    'Northside Clinic',
  ],
  retail: [
    'Flagship Store – Downtown',
    'Mall Branch',
    'Westside Outlet',
  ],
};

export const industrySupportTopics = {
  banking: [
    'Account Issues',
    'Loan Inquiries',
    'Card Services',
    'Online Banking',
    'Fees and Charges',
    'Technical Support'
  ],
  healthcare: [
    'Appointment Scheduling',
    'Medical Records',
    'Billing Questions',
    'Insurance Claims',
    'Prescription Issues',
    'General Medical Inquiry'
  ],
  retail: [
    'Order Status',
    'Product Information',
    'Returns & Refunds',
    'Shipping Issues',
    'Product Defects',
    'Store Policies'
  ],
  government: [
    'Application Status',
    'Document Requirements',
    'Fee Information',
    'Processing Times',
    'Service Hours',
    'General Inquiry'
  ],
  education: [
    'Admission Requirements',
    'Course Registration',
    'Tuition & Fees',
    'Financial Aid',
    'Academic Records',
    'Campus Services'
  ],
  corporate: [
    'IT Issues',
    'HR Questions',
    'Facility Problems',
    'Equipment Requests',
    'Policy Questions',
    'Administrative Support'
  ]
};
