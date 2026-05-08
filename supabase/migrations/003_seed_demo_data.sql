-- =====================================================
-- SEED DEMO DATA (Businesses, Counters, Demo Users)
-- =====================================================

-- Note: This assumes you've already run 001_initial_schema.sql and 002_seed_services.sql

-- =====================================================
-- DEMO BUSINESSES
-- =====================================================

-- Banking Business
INSERT INTO businesses (id, name, industry_id, address, phone, email, status) VALUES
  ('b1111111-1111-1111-1111-111111111111', 'First National Bank', 'banking', '123 Finance Street, Downtown', '+1-555-0101', 'contact@firstnationalbank.com', 'approved')
ON CONFLICT (id) DO NOTHING;

-- Healthcare Business
INSERT INTO businesses (id, name, industry_id, address, phone, email, status) VALUES
  ('b2222222-2222-2222-2222-222222222222', 'City Medical Center', 'healthcare', '456 Health Avenue, Medical District', '+1-555-0202', 'info@citymedical.com', 'approved')
ON CONFLICT (id) DO NOTHING;

-- Retail Business
INSERT INTO businesses (id, name, industry_id, address, phone, email, status) VALUES
  ('b3333333-3333-3333-3333-333333333333', 'TechMart Electronics', 'retail', '789 Shopping Plaza, Mall District', '+1-555-0303', 'support@techmart.com', 'approved')
ON CONFLICT (id) DO NOTHING;

-- Government Business
INSERT INTO businesses (id, name, industry_id, address, phone, email, status) VALUES
  ('b4444444-4444-4444-4444-444444444444', 'City Hall Services', 'government', '321 Government Way, Civic Center', '+1-555-0404', 'services@cityhall.gov', 'approved')
ON CONFLICT (id) DO NOTHING;

-- Education Business
INSERT INTO businesses (id, name, industry_id, address, phone, email, status) VALUES
  ('b5555555-5555-5555-5555-555555555555', 'State University', 'education', '654 Campus Drive, University District', '+1-555-0505', 'admissions@stateuniversity.edu', 'approved')
ON CONFLICT (id) DO NOTHING;

-- Corporate Business
INSERT INTO businesses (id, name, industry_id, address, phone, email, status) VALUES
  ('b6666666-6666-6666-6666-666666666666', 'Global Tech Corp', 'corporate', '987 Corporate Blvd, Business Park', '+1-555-0606', 'hr@globaltechcorp.com', 'approved')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- DEMO COUNTERS
-- =====================================================

-- Banking Counters (3 counters)
INSERT INTO counters (id, business_id, name, industry_id, status) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'Counter 1', 'banking', 'active'),
  ('c1111111-1111-1111-1111-111111111112', 'b1111111-1111-1111-1111-111111111111', 'Counter 2', 'banking', 'active'),
  ('c1111111-1111-1111-1111-111111111113', 'b1111111-1111-1111-1111-111111111111', 'Counter 3', 'banking', 'active')
ON CONFLICT (id) DO NOTHING;

-- Healthcare Counters (4 counters)
INSERT INTO counters (id, business_id, name, industry_id, status) VALUES
  ('c2222222-2222-2222-2222-222222222221', 'b2222222-2222-2222-2222-222222222222', 'Reception 1', 'healthcare', 'active'),
  ('c2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'Reception 2', 'healthcare', 'active'),
  ('c2222222-2222-2222-2222-222222222223', 'b2222222-2222-2222-2222-222222222222', 'Lab Services', 'healthcare', 'active'),
  ('c2222222-2222-2222-2222-222222222224', 'b2222222-2222-2222-2222-222222222222', 'Pharmacy', 'healthcare', 'active')
ON CONFLICT (id) DO NOTHING;

-- Retail Counters (3 counters)
INSERT INTO counters (id, business_id, name, industry_id, status) VALUES
  ('c3333333-3333-3333-3333-333333333331', 'b3333333-3333-3333-3333-333333333333', 'Customer Service', 'retail', 'active'),
  ('c3333333-3333-3333-3333-333333333332', 'b3333333-3333-3333-3333-333333333333', 'Returns Desk', 'retail', 'active'),
  ('c3333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 'Tech Support', 'retail', 'active')
ON CONFLICT (id) DO NOTHING;

-- Government Counters (4 counters)
INSERT INTO counters (id, business_id, name, industry_id, status) VALUES
  ('c4444444-4444-4444-4444-444444444441', 'b4444444-4444-4444-4444-444444444444', 'Window 1', 'government', 'active'),
  ('c4444444-4444-4444-4444-444444444442', 'b4444444-4444-4444-4444-444444444444', 'Window 2', 'government', 'active'),
  ('c4444444-4444-4444-4444-444444444443', 'b4444444-4444-4444-4444-444444444444', 'Window 3', 'government', 'active'),
  ('c4444444-4444-4444-4444-444444444444', 'b4444444-4444-4444-4444-444444444444', 'Permits Office', 'government', 'active')
ON CONFLICT (id) DO NOTHING;

-- Education Counters (3 counters)
INSERT INTO counters (id, business_id, name, industry_id, status) VALUES
  ('c5555555-5555-5555-5555-555555555551', 'b5555555-5555-5555-5555-555555555555', 'Admissions', 'education', 'active'),
  ('c5555555-5555-5555-5555-555555555552', 'b5555555-5555-5555-5555-555555555555', 'Financial Aid', 'education', 'active'),
  ('c5555555-5555-5555-5555-555555555553', 'b5555555-5555-5555-5555-555555555555', 'Registrar', 'education', 'active')
ON CONFLICT (id) DO NOTHING;

-- Corporate Counters (3 counters)
INSERT INTO counters (id, business_id, name, industry_id, status) VALUES
  ('c6666666-6666-6666-6666-666666666661', 'b6666666-6666-6666-6666-666666666666', 'HR Desk', 'corporate', 'active'),
  ('c6666666-6666-6666-6666-666666666662', 'b6666666-6666-6666-6666-666666666666', 'IT Support', 'corporate', 'active'),
  ('c6666666-6666-6666-6666-666666666663', 'b6666666-6666-6666-6666-666666666666', 'Facilities', 'corporate', 'active')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- UPDATE COUNTER SERVICE IDS
-- =====================================================
-- Note: Run this AFTER services are seeded

-- Get service IDs and assign them to counters
DO $$
DECLARE
  banking_service_ids TEXT[];
  healthcare_service_ids TEXT[];
  retail_service_ids TEXT[];
  government_service_ids TEXT[];
  education_service_ids TEXT[];
  corporate_service_ids TEXT[];
BEGIN
  -- Get all service IDs for each industry
  SELECT ARRAY_AGG(id::TEXT) INTO banking_service_ids FROM services WHERE industry_id = 'banking';
  SELECT ARRAY_AGG(id::TEXT) INTO healthcare_service_ids FROM services WHERE industry_id = 'healthcare';
  SELECT ARRAY_AGG(id::TEXT) INTO retail_service_ids FROM services WHERE industry_id = 'retail';
  SELECT ARRAY_AGG(id::TEXT) INTO government_service_ids FROM services WHERE industry_id = 'government';
  SELECT ARRAY_AGG(id::TEXT) INTO education_service_ids FROM services WHERE industry_id = 'education';
  SELECT ARRAY_AGG(id::TEXT) INTO corporate_service_ids FROM services WHERE industry_id = 'corporate';

  -- Update counters with their service IDs
  UPDATE counters SET service_ids = banking_service_ids WHERE industry_id = 'banking';
  UPDATE counters SET service_ids = healthcare_service_ids WHERE industry_id = 'healthcare';
  UPDATE counters SET service_ids = retail_service_ids WHERE industry_id = 'retail';
  UPDATE counters SET service_ids = government_service_ids WHERE industry_id = 'government';
  UPDATE counters SET service_ids = education_service_ids WHERE industry_id = 'education';
  UPDATE counters SET service_ids = corporate_service_ids WHERE industry_id = 'corporate';
END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify your data was inserted correctly

-- Check industries (should be 6)
-- SELECT COUNT(*) as industry_count FROM industries;

-- Check services (should be 30)
-- SELECT industry_id, COUNT(*) as service_count FROM services GROUP BY industry_id;

-- Check businesses (should be 6)
-- SELECT COUNT(*) as business_count FROM businesses;

-- Check counters (should be 20 total)
-- SELECT industry_id, COUNT(*) as counter_count FROM counters GROUP BY industry_id;

-- View all businesses with counter counts
-- SELECT b.name, b.industry_id, COUNT(c.id) as counter_count
-- FROM businesses b
-- LEFT JOIN counters c ON b.id = c.business_id
-- GROUP BY b.id, b.name, b.industry_id;
