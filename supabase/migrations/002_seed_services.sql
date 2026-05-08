-- =====================================================
-- SEED SERVICES DATA
-- =====================================================

-- Banking Services
INSERT INTO services (industry_id, name, description, estimated_time, is_active) VALUES
  ('banking', 'Account Opening', 'Open a new bank account', 20, true),
  ('banking', 'Loan Inquiry', 'Inquire about loan options', 25, true),
  ('banking', 'Investment Consultation', 'Discuss investment opportunities', 30, true),
  ('banking', 'Card Services', 'Credit/debit card services', 15, true),
  ('banking', 'General Inquiry', 'General banking questions', 10, true)
ON CONFLICT DO NOTHING;

-- Healthcare Services
INSERT INTO services (industry_id, name, description, estimated_time, is_active) VALUES
  ('healthcare', 'General Consultation', 'See a general practitioner', 30, true),
  ('healthcare', 'Specialist Consultation', 'See a specialist doctor', 45, true),
  ('healthcare', 'Lab Tests', 'Get lab work done', 20, true),
  ('healthcare', 'Prescription Refill', 'Refill your prescription', 10, true),
  ('healthcare', 'Vaccination', 'Get vaccinated', 15, true)
ON CONFLICT DO NOTHING;

-- Retail Services
INSERT INTO services (industry_id, name, description, estimated_time, is_active) VALUES
  ('retail', 'Product Inquiry', 'Ask about products', 15, true),
  ('retail', 'Returns & Exchanges', 'Return or exchange items', 20, true),
  ('retail', 'Customer Support', 'Get assistance', 15, true),
  ('retail', 'Warranty Service', 'Warranty claims', 25, true),
  ('retail', 'Personal Shopping', 'Personal shopping assistance', 30, true)
ON CONFLICT DO NOTHING;

-- Government Services
INSERT INTO services (industry_id, name, description, estimated_time, is_active) VALUES
  ('government', 'Documentation', 'Document processing', 25, true),
  ('government', 'Permits & Licenses', 'Apply for permits or licenses', 30, true),
  ('government', 'Public Records', 'Access public records', 20, true),
  ('government', 'General Inquiry', 'General government services', 15, true),
  ('government', 'Citizen Services', 'Various citizen services', 20, true)
ON CONFLICT DO NOTHING;

-- Education Services
INSERT INTO services (industry_id, name, description, estimated_time, is_active) VALUES
  ('education', 'Admissions', 'Admission inquiries', 30, true),
  ('education', 'Counseling', 'Academic counseling', 40, true),
  ('education', 'Registration', 'Course registration', 20, true),
  ('education', 'Financial Aid', 'Financial aid assistance', 25, true),
  ('education', 'Student Services', 'General student services', 15, true)
ON CONFLICT DO NOTHING;

-- Corporate Services
INSERT INTO services (industry_id, name, description, estimated_time, is_active) VALUES
  ('corporate', 'HR Services', 'Human resources assistance', 25, true),
  ('corporate', 'IT Support', 'Technical support', 30, true),
  ('corporate', 'Facilities', 'Facility management', 20, true),
  ('corporate', 'Security', 'Security services', 15, true),
  ('corporate', 'General Services', 'General office services', 10, true)
ON CONFLICT DO NOTHING;
