-- =====================================================
-- PRODUCTION-READY SCHEMA UPDATE FOR SQMS
-- =====================================================
-- This updates your database for production launch
-- Run this in Supabase SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: CREATE BUSINESSES/BRANCHES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  industry_id TEXT NOT NULL REFERENCES industries(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  hours TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_businesses_industry ON businesses(industry_id);
CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status);

-- =====================================================
-- STEP 2: UPDATE USERS TABLE
-- =====================================================

-- Add branch_id column to users (so staff can be assigned to a specific branch)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES businesses(id) ON DELETE SET NULL;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_branch ON users(branch_id);

-- =====================================================
-- STEP 3: CREATE STAFF_SERVICES JUNCTION TABLE
-- =====================================================
-- This table tracks which services each staff member handles

CREATE TABLE IF NOT EXISTS staff_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  staff_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(staff_id, service_id)
);

CREATE INDEX IF NOT EXISTS idx_staff_services_staff ON staff_services(staff_id);
CREATE INDEX IF NOT EXISTS idx_staff_services_service ON staff_services(service_id);

-- =====================================================
-- STEP 4: INSERT BRANCH/BUSINESS DATA
-- =====================================================

-- Banking Branches
INSERT INTO businesses (id, industry_id, name, address, phone, email, hours, status) VALUES
  ('b1111111-1111-1111-1111-111111111111', 'banking', 'First National Bank - Downtown', '123 Financial District, Manhattan, NY 10005', '+1 (212) 555-0100', 'downtown@fnb.com', '9:00 AM - 6:00 PM', 'active'),
  ('b1111111-1111-1111-1111-111111111112', 'banking', 'First National Bank - Midtown', '456 Park Avenue, New York, NY 10022', '+1 (212) 555-0200', 'midtown@fnb.com', '9:00 AM - 6:00 PM', 'active'),
  ('b1111111-1111-1111-1111-111111111113', 'banking', 'First National Bank - Brooklyn', '789 Atlantic Avenue, Brooklyn, NY 11217', '+1 (718) 555-0300', 'brooklyn@fnb.com', '9:00 AM - 5:00 PM', 'active'),
  ('b1111111-1111-1111-1111-111111111114', 'banking', 'First National Bank - Queens', '321 Main Street, Flushing, NY 11354', '+1 (718) 555-0400', 'queens@fnb.com', '9:00 AM - 5:00 PM', 'active')
ON CONFLICT (id) DO NOTHING;

-- Healthcare Branches
INSERT INTO businesses (id, industry_id, name, address, phone, email, hours, status) VALUES
  ('b2222222-2222-2222-2222-222222222221', 'healthcare', 'City General Hospital - Main Campus', '100 Medical Plaza, New York, NY 10016', '+1 (212) 555-1000', 'main@cityhospital.org', '24/7 Emergency', 'active'),
  ('b2222222-2222-2222-2222-222222222222', 'healthcare', 'City General Hospital - North Clinic', '250 Health Avenue, Bronx, NY 10461', '+1 (718) 555-1100', 'north@cityhospital.org', '7:00 AM - 10:00 PM', 'active'),
  ('b2222222-2222-2222-2222-222222222223', 'healthcare', 'City General Hospital - East Center', '500 Wellness Drive, Queens, NY 11365', '+1 (718) 555-1200', 'east@cityhospital.org', '8:00 AM - 8:00 PM', 'active'),
  ('b2222222-2222-2222-2222-222222222224', 'healthcare', 'City General Hospital - Community Clinic', '75 Care Street, Brooklyn, NY 11201', '+1 (718) 555-1300', 'community@cityhospital.org', '8:00 AM - 6:00 PM', 'active')
ON CONFLICT (id) DO NOTHING;

-- Retail Branches
INSERT INTO businesses (id, industry_id, name, address, phone, email, hours, status) VALUES
  ('b3333333-3333-3333-3333-333333333331', 'retail', 'MegaStore - Manhattan Plaza', '200 Shopping Center, New York, NY 10001', '+1 (212) 555-4000', 'manhattan@megastore.com', '10:00 AM - 9:00 PM', 'active'),
  ('b3333333-3333-3333-3333-333333333332', 'retail', 'MegaStore - Brooklyn Mall', '350 Retail Avenue, Brooklyn, NY 11220', '+1 (718) 555-4100', 'brooklyn@megastore.com', '10:00 AM - 8:00 PM', 'active'),
  ('b3333333-3333-3333-3333-333333333333', 'retail', 'MegaStore - Queens Center', '450 Commerce Drive, Queens, NY 11373', '+1 (718) 555-4200', 'queens@megastore.com', '9:00 AM - 9:00 PM', 'active')
ON CONFLICT (id) DO NOTHING;

-- Government Branches
INSERT INTO businesses (id, industry_id, name, address, phone, email, hours, status) VALUES
  ('b4444444-4444-4444-4444-444444444441', 'government', 'Department of Motor Vehicles - Manhattan', '11 Greenwich Street, New York, NY 10004', '+1 (212) 555-2000', 'manhattan@dmv.gov', '8:30 AM - 4:30 PM', 'active'),
  ('b4444444-4444-4444-4444-444444444442', 'government', 'City Hall Services Center', '1 City Hall Plaza, New York, NY 10007', '+1 (212) 555-2100', 'services@cityhall.gov', '9:00 AM - 5:00 PM', 'active'),
  ('b4444444-4444-4444-4444-444444444443', 'government', 'Social Services Office - Brooklyn', '350 Jay Street, Brooklyn, NY 11201', '+1 (718) 555-2200', 'brooklyn@socialservices.gov', '9:00 AM - 5:00 PM', 'active'),
  ('b4444444-4444-4444-4444-444444444444', 'government', 'Tax Assessment Office', '66 John Street, New York, NY 10038', '+1 (212) 555-2300', 'tax@nyc.gov', '9:00 AM - 4:00 PM', 'active')
ON CONFLICT (id) DO NOTHING;

-- Education Branches
INSERT INTO businesses (id, industry_id, name, address, phone, email, hours, status) VALUES
  ('b5555555-5555-5555-5555-555555555551', 'education', 'State University - Main Campus', '1 University Plaza, New York, NY 10003', '+1 (212) 555-5000', 'main@stateuniversity.edu', '8:00 AM - 6:00 PM', 'active'),
  ('b5555555-5555-5555-5555-555555555552', 'education', 'State University - Admissions Office', '50 Student Center, New York, NY 10003', '+1 (212) 555-5100', 'admissions@stateuniversity.edu', '9:00 AM - 5:00 PM', 'active'),
  ('b5555555-5555-5555-5555-555555555553', 'education', 'Community College - Brooklyn Campus', '300 Education Way, Brooklyn, NY 11210', '+1 (718) 555-5200', 'brooklyn@communitycollege.edu', '8:00 AM - 7:00 PM', 'active')
ON CONFLICT (id) DO NOTHING;

-- Corporate Branches
INSERT INTO businesses (id, industry_id, name, address, phone, email, hours, status) VALUES
  ('b6666666-6666-6666-6666-666666666661', 'corporate', 'TechCorp Headquarters - Floor 5 HR', '500 Corporate Plaza, New York, NY 10017', '+1 (212) 555-6000', 'hr@techcorp.com', '9:00 AM - 6:00 PM', 'active'),
  ('b6666666-6666-6666-6666-666666666662', 'corporate', 'TechCorp - IT Help Desk', '500 Corporate Plaza, Floor 2, New York, NY 10017', '+1 (212) 555-6100', 'itdesk@techcorp.com', '8:00 AM - 8:00 PM', 'active'),
  ('b6666666-6666-6666-6666-666666666663', 'corporate', 'TechCorp - Brooklyn Office', '100 Business Park, Brooklyn, NY 11201', '+1 (718) 555-6200', 'brooklyn@techcorp.com', '9:00 AM - 6:00 PM', 'active')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 5: ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on new tables
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_services ENABLE ROW LEVEL SECURITY;

-- Businesses policies
CREATE POLICY "Anyone can view businesses"
  ON businesses FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage businesses"
  ON businesses FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'superadmin')
    )
  );

-- Staff services policies
CREATE POLICY "Staff can view their own services"
  ON staff_services FOR SELECT
  USING (staff_id = auth.uid() OR EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'superadmin', 'staff')
  ));

CREATE POLICY "Only admins can manage staff services"
  ON staff_services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'superadmin')
    )
  );

-- =====================================================
-- STEP 6: HELPER FUNCTIONS
-- =====================================================

-- Function to get staff's assigned services
CREATE OR REPLACE FUNCTION get_staff_services(staff_user_id UUID)
RETURNS TABLE (
  service_id UUID,
  service_name TEXT,
  service_description TEXT,
  estimated_time INTEGER
)
LANGUAGE sql
STABLE
AS $$
  SELECT
    s.id as service_id,
    s.name as service_name,
    s.description as service_description,
    s.estimated_time
  FROM services s
  INNER JOIN staff_services ss ON s.id = ss.service_id
  WHERE ss.staff_id = staff_user_id
  AND s.is_active = true
  ORDER BY s.name;
$$;

-- Function to assign service to staff
CREATE OR REPLACE FUNCTION assign_service_to_staff(
  staff_user_id UUID,
  service_uuid UUID
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO staff_services (staff_id, service_id)
  VALUES (staff_user_id, service_uuid)
  ON CONFLICT (staff_id, service_id) DO NOTHING;
END;
$$;

-- Function to remove service from staff
CREATE OR REPLACE FUNCTION remove_service_from_staff(
  staff_user_id UUID,
  service_uuid UUID
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  DELETE FROM staff_services
  WHERE staff_id = staff_user_id
  AND service_id = service_uuid;
END;
$$;

-- =====================================================
-- STEP 7: VERIFY SETUP
-- =====================================================

-- Check businesses were created
SELECT industry_id, COUNT(*) as branch_count
FROM businesses
GROUP BY industry_id
ORDER BY industry_id;

-- Check new columns exist
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name = 'branch_id';

-- Check staff_services table exists
SELECT COUNT(*) as staff_service_assignments
FROM staff_services;

-- =====================================================
-- PRODUCTION READY! ✅
-- =====================================================
-- Next steps:
-- 1. Assign staff to branches using: UPDATE users SET branch_id = 'branch-uuid' WHERE id = 'user-uuid'
-- 2. Assign services to staff using: SELECT assign_service_to_staff('user-uuid', 'service-uuid')
-- 3. Admins can now manage their industry
-- 4. Superadmin can manage everything
-- =====================================================
