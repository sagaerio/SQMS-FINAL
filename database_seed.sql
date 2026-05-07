-- =====================================================
-- SQMS Database Seed Data
-- Run this SQL in your Supabase SQL Editor to populate initial data
-- =====================================================

-- =====================================================
-- 1. INDUSTRIES
-- =====================================================

INSERT INTO industries (name, icon, color, description) VALUES
('Banking', '🏦', 'from-blue-600 to-blue-700', 'Financial services and banking'),
('Healthcare', '❤️', 'from-red-600 to-pink-600', 'Medical and healthcare services'),
('Retail', '🛍️', 'from-purple-600 to-purple-700', 'Retail and shopping services'),
('Government', '🏛️', 'from-teal-600 to-teal-700', 'Government and public services'),
('Education', '🎓', 'from-orange-600 to-orange-700', 'Educational institutions'),
('Corporate', '💼', 'from-slate-600 to-slate-700', 'Corporate office services')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 2. SERVICES (by Industry)
-- =====================================================

-- Banking Services
INSERT INTO services (industry_id, name, description, estimated_time, is_active)
SELECT
  i.id,
  s.name,
  s.description,
  s.estimated_time,
  true
FROM industries i
CROSS JOIN (
  VALUES
    ('Account Opening', 'Open a new bank account', 15),
    ('Loan Inquiry', 'Inquire about loan options and applications', 20),
    ('Investment Consultation', 'Discuss investment opportunities with advisors', 30),
    ('Card Services', 'Credit/debit card services and support', 10),
    ('General Banking Inquiry', 'General banking questions and support', 10),
    ('Foreign Exchange', 'Currency exchange and international transfers', 15),
    ('Document Verification', 'Verify and process banking documents', 12)
) AS s(name, description, estimated_time)
WHERE i.name = 'Banking'
ON CONFLICT DO NOTHING;

-- Healthcare Services
INSERT INTO services (industry_id, name, description, estimated_time, is_active)
SELECT
  i.id,
  s.name,
  s.description,
  s.estimated_time,
  true
FROM industries i
CROSS JOIN (
  VALUES
    ('General Consultation', 'See a general practitioner', 20),
    ('Specialist Consultation', 'See a specialist doctor', 30),
    ('Lab Tests', 'Get lab work and medical tests done', 15),
    ('Prescription Refill', 'Refill your prescription medication', 10),
    ('Vaccination', 'Get vaccinated', 15),
    ('Health Screening', 'Comprehensive health screening', 40),
    ('Medical Records', 'Access and request medical records', 10)
) AS s(name, description, estimated_time)
WHERE i.name = 'Healthcare'
ON CONFLICT DO NOTHING;

-- Retail Services
INSERT INTO services (industry_id, name, description, estimated_time, is_active)
SELECT
  i.id,
  s.name,
  s.description,
  s.estimated_time,
  true
FROM industries i
CROSS JOIN (
  VALUES
    ('Product Inquiry', 'Ask about products and availability', 10),
    ('Returns & Exchanges', 'Return or exchange items', 15),
    ('Customer Support', 'Get general assistance', 10),
    ('Warranty Service', 'Process warranty claims', 20),
    ('Personal Shopping', 'Personal shopping assistance', 30),
    ('Gift Registry', 'Set up or manage gift registry', 15)
) AS s(name, description, estimated_time)
WHERE i.name = 'Retail'
ON CONFLICT DO NOTHING;

-- Government Services
INSERT INTO services (industry_id, name, description, estimated_time, is_active)
SELECT
  i.id,
  s.name,
  s.description,
  s.estimated_time,
  true
FROM industries i
CROSS JOIN (
  VALUES
    ('Documentation', 'Document processing and certification', 20),
    ('Permits & Licenses', 'Apply for permits or licenses', 25),
    ('Public Records', 'Access public records and information', 15),
    ('General Inquiry', 'General government services inquiry', 10),
    ('Citizen Services', 'Various citizen services', 15),
    ('Voting Registration', 'Register to vote', 12),
    ('Tax Services', 'Tax-related inquiries and filing', 30)
) AS s(name, description, estimated_time)
WHERE i.name = 'Government'
ON CONFLICT DO NOTHING;

-- Education Services
INSERT INTO services (industry_id, name, description, estimated_time, is_active)
SELECT
  i.id,
  s.name,
  s.description,
  s.estimated_time,
  true
FROM industries i
CROSS JOIN (
  VALUES
    ('Admissions', 'Admission inquiries and applications', 20),
    ('Academic Counseling', 'Academic guidance and counseling', 30),
    ('Course Registration', 'Register for courses', 15),
    ('Financial Aid', 'Financial aid assistance and applications', 25),
    ('Student Services', 'General student services', 15),
    ('Transcript Request', 'Request academic transcripts', 10),
    ('Scholarship Information', 'Information about scholarships', 20)
) AS s(name, description, estimated_time)
WHERE i.name = 'Education'
ON CONFLICT DO NOTHING;

-- Corporate Services
INSERT INTO services (industry_id, name, description, estimated_time, is_active)
SELECT
  i.id,
  s.name,
  s.description,
  s.estimated_time,
  true
FROM industries i
CROSS JOIN (
  VALUES
    ('HR Services', 'Human resources assistance', 20),
    ('IT Support', 'Technical support and troubleshooting', 25),
    ('Facilities Management', 'Facility-related requests', 15),
    ('Security Services', 'Security and access control', 15),
    ('Meeting Room Booking', 'Reserve meeting rooms', 10),
    ('Employee Onboarding', 'New employee onboarding', 30),
    ('Benefits Inquiry', 'Employee benefits questions', 20)
) AS s(name, description, estimated_time)
WHERE i.name = 'Corporate'
ON CONFLICT DO NOTHING;

-- =====================================================
-- 3. SAMPLE BUSINESSES (Optional)
-- =====================================================

-- Banking Branch
INSERT INTO businesses (name, industry_id, address, phone, email, status)
SELECT
  'Downtown Financial Center',
  id,
  '123 Main Street, New York, NY 10001',
  '+1 (555) 100-2000',
  'info@downtown-financial.example.com',
  'approved'
FROM industries WHERE name = 'Banking'
ON CONFLICT DO NOTHING;

-- Healthcare Clinic
INSERT INTO businesses (name, industry_id, address, phone, email, status)
SELECT
  'City Medical Center',
  id,
  '456 Health Avenue, New York, NY 10002',
  '+1 (555) 200-3000',
  'contact@citymedical.example.com',
  'approved'
FROM industries WHERE name = 'Healthcare'
ON CONFLICT DO NOTHING;

-- Retail Store
INSERT INTO businesses (name, industry_id, address, phone, email, status)
SELECT
  'Flagship Retail Store',
  id,
  '789 Shopping Boulevard, New York, NY 10003',
  '+1 (555) 300-4000',
  'support@flagship-retail.example.com',
  'approved'
FROM industries WHERE name = 'Retail'
ON CONFLICT DO NOTHING;

-- =====================================================
-- 4. SAMPLE COUNTERS (Optional - requires business_id)
-- =====================================================

-- You can add counters after creating businesses. Example:
--
-- INSERT INTO counters (business_id, name, industry_id, service_ids, status)
-- SELECT
--   b.id,
--   'Counter ' || generate_series,
--   b.industry_id,
--   ARRAY(SELECT id FROM services WHERE industry_id = b.industry_id LIMIT 3),
--   'active'
-- FROM businesses b
-- CROSS JOIN generate_series(1, 5)
-- WHERE b.name = 'Downtown Financial Center';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check industries
SELECT 'Industries:', COUNT(*) as count FROM industries;

-- Check services by industry
SELECT i.name as industry, COUNT(s.id) as service_count
FROM industries i
LEFT JOIN services s ON s.industry_id = i.id
GROUP BY i.name
ORDER BY i.name;

-- Check businesses
SELECT 'Businesses:', COUNT(*) as count FROM businesses;

-- =====================================================
-- NOTES
-- =====================================================
--
-- 1. This seed file populates the core data needed to get started
-- 2. You still need to:
--    - Create user accounts via Supabase Auth UI
--    - Add those users to the 'users' table with appropriate roles
--    - Set up counters for your businesses
--    - Configure RLS policies for security
--
-- 3. For testing, create users with different roles:
--    - customer: Can join queues and book appointments
--    - staff: Can serve customers at counters
--    - admin: Can manage services and view analytics
--    - superadmin: Full system access
--
-- =====================================================
