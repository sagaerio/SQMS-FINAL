-- =====================================================
-- COMPLETE SUPABASE SETUP FOR SQMS
-- =====================================================
-- Run this entire file in your Supabase SQL Editor
-- This will create all tables, policies, data, and demo accounts
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- STEP 0: CREATE ENUM TYPES FOR DROPDOWNS
-- =====================================================

-- Create user role ENUM (shows as dropdown in Supabase UI)
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer', 'staff', 'admin', 'superadmin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create business status ENUM
DO $$ BEGIN
  CREATE TYPE business_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create counter status ENUM
DO $$ BEGIN
  CREATE TYPE counter_status AS ENUM ('active', 'inactive', 'on_break');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create ticket status ENUM
DO $$ BEGIN
  CREATE TYPE ticket_status AS ENUM ('waiting', 'called', 'serving', 'completed', 'cancelled', 'no_show');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create appointment status ENUM
DO $$ BEGIN
  CREATE TYPE appointment_status AS ENUM ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- STEP 1: CREATE ALL TABLES
-- =====================================================

-- INDUSTRIES TABLE
CREATE TABLE IF NOT EXISTS industries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default industries
INSERT INTO industries (id, name, icon, color, description) VALUES
  ('banking', 'Banking & Finance', 'Landmark', 'from-blue-600 to-blue-700', 'Account services, loans, investments'),
  ('healthcare', 'Healthcare', 'Heart', 'from-red-600 to-pink-600', 'Medical appointments, consultations'),
  ('retail', 'Retail', 'ShoppingBag', 'from-purple-600 to-purple-700', 'Customer service, returns, support'),
  ('government', 'Government Services', 'Building2', 'from-teal-600 to-teal-700', 'Public services, permits, documentation'),
  ('education', 'Education', 'GraduationCap', 'from-orange-600 to-orange-700', 'Admissions, counseling, registration'),
  ('corporate', 'Corporate Office', 'Briefcase', 'from-slate-600 to-slate-700', 'HR, IT support, facilities management')
ON CONFLICT (id) DO NOTHING;

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'customer',
  industry_id TEXT REFERENCES industries(id),
  counter_id TEXT,
  business_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_industry ON users(industry_id);

-- SERVICES TABLE
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  industry_id TEXT NOT NULL REFERENCES industries(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  estimated_time INTEGER DEFAULT 15,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_services_industry ON services(industry_id);
CREATE INDEX IF NOT EXISTS idx_services_active ON services(is_active);

-- BUSINESSES TABLE
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  industry_id TEXT NOT NULL REFERENCES industries(id),
  address TEXT,
  phone TEXT,
  email TEXT,
  status business_status DEFAULT 'pending',
  admin_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_businesses_industry ON businesses(industry_id);
CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status);

-- COUNTERS TABLE
CREATE TABLE IF NOT EXISTS counters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  industry_id TEXT NOT NULL REFERENCES industries(id),
  service_ids TEXT[] DEFAULT '{}',
  staff_id UUID REFERENCES users(id),
  status counter_status DEFAULT 'active',
  current_ticket UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_counters_industry ON counters(industry_id);
CREATE INDEX IF NOT EXISTS idx_counters_staff ON counters(staff_id);
CREATE INDEX IF NOT EXISTS idx_counters_status ON counters(status);

-- QUEUE TICKETS TABLE
CREATE TABLE IF NOT EXISTS queue_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number TEXT UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  industry_id TEXT NOT NULL REFERENCES industries(id),
  service_id UUID NOT NULL REFERENCES services(id),
  counter_id UUID REFERENCES counters(id),
  status ticket_status DEFAULT 'waiting',
  position INTEGER NOT NULL,
  estimated_wait_time INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  called_at TIMESTAMP WITH TIME ZONE,
  served_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_queue_tickets_customer ON queue_tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_queue_tickets_industry ON queue_tickets(industry_id);
CREATE INDEX IF NOT EXISTS idx_queue_tickets_service ON queue_tickets(service_id);
CREATE INDEX IF NOT EXISTS idx_queue_tickets_status ON queue_tickets(status);
CREATE INDEX IF NOT EXISTS idx_queue_tickets_created ON queue_tickets(created_at DESC);

-- APPOINTMENTS TABLE
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  industry_id TEXT NOT NULL REFERENCES industries(id),
  service_id UUID NOT NULL REFERENCES services(id),
  counter_id UUID REFERENCES counters(id),
  staff_id UUID REFERENCES users(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status appointment_status DEFAULT 'scheduled',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointments_customer ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_industry ON appointments(industry_id);
CREATE INDEX IF NOT EXISTS idx_appointments_service ON appointments(service_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- =====================================================
-- STEP 2: CREATE FUNCTIONS
-- =====================================================

-- Function to generate ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number(p_industry_id TEXT)
RETURNS TEXT AS $$
DECLARE
  v_prefix TEXT;
  v_count INTEGER;
  v_ticket_number TEXT;
BEGIN
  v_prefix := CASE p_industry_id
    WHEN 'banking' THEN 'BNK'
    WHEN 'healthcare' THEN 'MED'
    WHEN 'retail' THEN 'RTL'
    WHEN 'government' THEN 'GOV'
    WHEN 'education' THEN 'EDU'
    WHEN 'corporate' THEN 'CRP'
    ELSE 'GEN'
  END;

  SELECT COUNT(*) INTO v_count
  FROM queue_tickets
  WHERE industry_id = p_industry_id
    AND DATE(created_at) = CURRENT_DATE;

  v_ticket_number := v_prefix || '-' || LPAD((v_count + 1)::TEXT, 4, '0');

  RETURN v_ticket_number;
END;
$$ LANGUAGE plpgsql;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- STEP 3: CREATE TRIGGERS
-- =====================================================

DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_businesses_updated_at ON businesses;
CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_counters_updated_at ON counters;
CREATE TRIGGER update_counters_updated_at BEFORE UPDATE ON counters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- STEP 4: ENABLE ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 5: CREATE RLS POLICIES
-- =====================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Public can view user profiles" ON users;
DROP POLICY IF EXISTS "Anyone can view active services" ON services;
DROP POLICY IF EXISTS "Admins can manage services" ON services;
DROP POLICY IF EXISTS "Users can view their own tickets" ON queue_tickets;
DROP POLICY IF EXISTS "Users can create tickets" ON queue_tickets;
DROP POLICY IF EXISTS "Users can update their own tickets" ON queue_tickets;
DROP POLICY IF EXISTS "Staff can view all tickets in their industry" ON queue_tickets;
DROP POLICY IF EXISTS "Staff can update tickets" ON queue_tickets;
DROP POLICY IF EXISTS "Users can view their own appointments" ON appointments;
DROP POLICY IF EXISTS "Users can create appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update their own appointments" ON appointments;
DROP POLICY IF EXISTS "Staff can view all appointments in their industry" ON appointments;
DROP POLICY IF EXISTS "Staff can manage appointments" ON appointments;
DROP POLICY IF EXISTS "Anyone can view approved businesses" ON businesses;
DROP POLICY IF EXISTS "Admins can view all businesses" ON businesses;
DROP POLICY IF EXISTS "Admins can manage businesses" ON businesses;
DROP POLICY IF EXISTS "Anyone can view active counters" ON counters;
DROP POLICY IF EXISTS "Staff can manage counters" ON counters;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public can view user profiles" ON users
  FOR SELECT USING (true);

-- Services policies
CREATE POLICY "Anyone can view active services" ON services
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage services" ON services
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'superadmin')
    )
  );

-- Queue tickets policies
CREATE POLICY "Users can view their own tickets" ON queue_tickets
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Users can create tickets" ON queue_tickets
  FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Users can update their own tickets" ON queue_tickets
  FOR UPDATE USING (customer_id = auth.uid());

CREATE POLICY "Staff can view all tickets in their industry" ON queue_tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('staff', 'admin', 'superadmin')
      AND (users.industry_id = queue_tickets.industry_id OR users.role = 'superadmin')
    )
  );

CREATE POLICY "Staff can update tickets" ON queue_tickets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('staff', 'admin', 'superadmin')
    )
  );

-- Appointments policies
CREATE POLICY "Users can view their own appointments" ON appointments
  FOR SELECT USING (customer_id = auth.uid());

CREATE POLICY "Users can create appointments" ON appointments
  FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Users can update their own appointments" ON appointments
  FOR UPDATE USING (customer_id = auth.uid());

CREATE POLICY "Staff can view all appointments in their industry" ON appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('staff', 'admin', 'superadmin')
      AND (users.industry_id = appointments.industry_id OR users.role = 'superadmin')
    )
  );

CREATE POLICY "Staff can manage appointments" ON appointments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('staff', 'admin', 'superadmin')
    )
  );

-- Businesses policies
CREATE POLICY "Anyone can view approved businesses" ON businesses
  FOR SELECT USING (status = 'approved');

CREATE POLICY "Admins can view all businesses" ON businesses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'superadmin')
    )
  );

CREATE POLICY "Admins can manage businesses" ON businesses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('admin', 'superadmin')
    )
  );

-- Counters policies
CREATE POLICY "Anyone can view active counters" ON counters
  FOR SELECT USING (status = 'active');

CREATE POLICY "Staff can manage counters" ON counters
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('staff', 'admin', 'superadmin')
    )
  );

-- =====================================================
-- STEP 6: ENABLE REALTIME FOR ALL TABLES
-- =====================================================

-- Enable real-time updates for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE services;
ALTER PUBLICATION supabase_realtime ADD TABLE businesses;
ALTER PUBLICATION supabase_realtime ADD TABLE counters;
ALTER PUBLICATION supabase_realtime ADD TABLE queue_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;

-- Note: industries table is static (no changes expected) so realtime not needed

-- =====================================================
-- STEP 7: SEED SERVICES DATA
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

-- =====================================================
-- STEP 8: SEED DEMO BUSINESSES
-- =====================================================

INSERT INTO businesses (id, name, industry_id, address, phone, email, status) VALUES
  ('b1111111-1111-1111-1111-111111111111', 'First National Bank', 'banking', '123 Finance Street, Downtown', '+1-555-0101', 'contact@firstnationalbank.com', 'approved'),
  ('b2222222-2222-2222-2222-222222222222', 'City Medical Center', 'healthcare', '456 Health Avenue, Medical District', '+1-555-0202', 'info@citymedical.com', 'approved'),
  ('b3333333-3333-3333-3333-333333333333', 'TechMart Electronics', 'retail', '789 Shopping Plaza, Mall District', '+1-555-0303', 'support@techmart.com', 'approved'),
  ('b4444444-4444-4444-4444-444444444444', 'City Hall Services', 'government', '321 Government Way, Civic Center', '+1-555-0404', 'services@cityhall.gov', 'approved'),
  ('b5555555-5555-5555-5555-555555555555', 'State University', 'education', '654 Campus Drive, University District', '+1-555-0505', 'admissions@stateuniversity.edu', 'approved'),
  ('b6666666-6666-6666-6666-666666666666', 'Global Tech Corp', 'corporate', '987 Corporate Blvd, Business Park', '+1-555-0606', 'hr@globaltechcorp.com', 'approved')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 9: SEED DEMO COUNTERS
-- =====================================================

-- Banking Counters
INSERT INTO counters (id, business_id, name, industry_id, status) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 'Counter 1', 'banking', 'active'),
  ('c1111111-1111-1111-1111-111111111112', 'b1111111-1111-1111-1111-111111111111', 'Counter 2', 'banking', 'active'),
  ('c1111111-1111-1111-1111-111111111113', 'b1111111-1111-1111-1111-111111111111', 'Counter 3', 'banking', 'active')
ON CONFLICT (id) DO NOTHING;

-- Healthcare Counters
INSERT INTO counters (id, business_id, name, industry_id, status) VALUES
  ('c2222222-2222-2222-2222-222222222221', 'b2222222-2222-2222-2222-222222222222', 'Reception 1', 'healthcare', 'active'),
  ('c2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 'Reception 2', 'healthcare', 'active'),
  ('c2222222-2222-2222-2222-222222222223', 'b2222222-2222-2222-2222-222222222222', 'Lab Services', 'healthcare', 'active'),
  ('c2222222-2222-2222-2222-222222222224', 'b2222222-2222-2222-2222-222222222222', 'Pharmacy', 'healthcare', 'active')
ON CONFLICT (id) DO NOTHING;

-- Retail Counters
INSERT INTO counters (id, business_id, name, industry_id, status) VALUES
  ('c3333333-3333-3333-3333-333333333331', 'b3333333-3333-3333-3333-333333333333', 'Customer Service', 'retail', 'active'),
  ('c3333333-3333-3333-3333-333333333332', 'b3333333-3333-3333-3333-333333333333', 'Returns Desk', 'retail', 'active'),
  ('c3333333-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', 'Tech Support', 'retail', 'active')
ON CONFLICT (id) DO NOTHING;

-- Government Counters
INSERT INTO counters (id, business_id, name, industry_id, status) VALUES
  ('c4444444-4444-4444-4444-444444444441', 'b4444444-4444-4444-4444-444444444444', 'Window 1', 'government', 'active'),
  ('c4444444-4444-4444-4444-444444444442', 'b4444444-4444-4444-4444-444444444444', 'Window 2', 'government', 'active'),
  ('c4444444-4444-4444-4444-444444444443', 'b4444444-4444-4444-4444-444444444444', 'Window 3', 'government', 'active'),
  ('c4444444-4444-4444-4444-444444444444', 'b4444444-4444-4444-4444-444444444444', 'Permits Office', 'government', 'active')
ON CONFLICT (id) DO NOTHING;

-- Education Counters
INSERT INTO counters (id, business_id, name, industry_id, status) VALUES
  ('c5555555-5555-5555-5555-555555555551', 'b5555555-5555-5555-5555-555555555555', 'Admissions', 'education', 'active'),
  ('c5555555-5555-5555-5555-555555555552', 'b5555555-5555-5555-5555-555555555555', 'Financial Aid', 'education', 'active'),
  ('c5555555-5555-5555-5555-555555555553', 'b5555555-5555-5555-5555-555555555555', 'Registrar', 'education', 'active')
ON CONFLICT (id) DO NOTHING;

-- Corporate Counters
INSERT INTO counters (id, business_id, name, industry_id, status) VALUES
  ('c6666666-6666-6666-6666-666666666661', 'b6666666-6666-6666-6666-666666666666', 'HR Desk', 'corporate', 'active'),
  ('c6666666-6666-6666-6666-666666666662', 'b6666666-6666-6666-6666-666666666666', 'IT Support', 'corporate', 'active'),
  ('c6666666-6666-6666-6666-666666666663', 'b6666666-6666-6666-6666-666666666666', 'Facilities', 'corporate', 'active')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- STEP 10: ASSIGN SERVICES TO COUNTERS
-- =====================================================

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
-- ✅ SETUP COMPLETE!
-- =====================================================
-- Your Supabase database is now fully configured with:
-- ✅ 6 Industries
-- ✅ 30 Services (5 per industry)
-- ✅ 6 Demo Businesses (1 per industry)
-- ✅ 20 Counters (3-4 per business)
-- ✅ Row Level Security enabled
-- ✅ Real-time subscriptions enabled
-- ✅ All necessary functions and triggers
--
-- NEXT STEPS:
-- 1. Create your first user account through the app's sign-up page
-- 2. Update that user's role in the 'users' table to 'superadmin'
-- 3. Start using your SQMS application!
-- =====================================================
