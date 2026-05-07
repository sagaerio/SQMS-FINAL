-- SQMS Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- INDUSTRIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS industries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default industries
INSERT INTO industries (id, name, icon, color, description) VALUES
  ('banking', 'Banking', 'Building2', 'blue', 'Financial services and banking'),
  ('healthcare', 'Healthcare', 'Heart', 'red', 'Medical and healthcare services'),
  ('retail', 'Retail', 'ShoppingBag', 'purple', 'Retail and shopping services'),
  ('government', 'Government', 'Landmark', 'green', 'Government and public services'),
  ('education', 'Education', 'GraduationCap', 'orange', 'Educational institutions'),
  ('corporate', 'Corporate', 'Briefcase', 'teal', 'Corporate and business services')
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- BUSINESSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  industry_id UUID REFERENCES industries(id),
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- USERS TABLE (extends Supabase auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('customer', 'staff', 'admin', 'superadmin')),
  industry_id UUID REFERENCES industries(id),
  counter_id UUID,
  business_id UUID REFERENCES businesses(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- SERVICES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  industry_id UUID REFERENCES industries(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  estimated_time INTEGER DEFAULT 15, -- in minutes
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default services for each industry
INSERT INTO services (industry_id, name, description, estimated_time) VALUES
  -- Banking
  ('banking', 'Account Opening', 'Open new bank account', 20),
  ('banking', 'Loan Application', 'Apply for personal or business loan', 30),
  ('banking', 'Money Transfer', 'International or domestic transfers', 15),
  ('banking', 'Card Services', 'Credit/debit card issuance', 10),

  -- Healthcare
  ('healthcare', 'General Consultation', 'Regular doctor consultation', 30),
  ('healthcare', 'Lab Tests', 'Blood tests and diagnostics', 15),
  ('healthcare', 'Prescription Refill', 'Medication refill service', 10),
  ('healthcare', 'Vaccination', 'Immunization services', 20),

  -- Retail
  ('retail', 'Customer Service', 'Returns and exchanges', 15),
  ('retail', 'Product Inquiry', 'Product information', 10),
  ('retail', 'Gift Registry', 'Wedding/gift registry', 20),

  -- Government
  ('government', 'License Renewal', 'Driver license renewal', 25),
  ('government', 'Passport Application', 'New passport or renewal', 30),
  ('government', 'Permit Application', 'Building or business permits', 20),

  -- Education
  ('education', 'Admissions', 'Student admissions inquiry', 25),
  ('education', 'Registration', 'Course registration', 20),
  ('education', 'Transcript Request', 'Academic records', 15),

  -- Corporate
  ('corporate', 'HR Services', 'Employee services', 20),
  ('corporate', 'IT Support', 'Technical assistance', 25),
  ('corporate', 'Facilities', 'Facility requests', 15)
ON CONFLICT DO NOTHING;

-- =====================================================
-- COUNTERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS counters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) NOT NULL,
  name TEXT NOT NULL,
  industry_id UUID REFERENCES industries(id) NOT NULL,
  service_ids UUID[] DEFAULT '{}',
  staff_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'on_break')),
  current_ticket UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- QUEUE TICKETS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS queue_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES users(id) NOT NULL,
  industry_id UUID REFERENCES industries(id) NOT NULL,
  service_id UUID REFERENCES services(id) NOT NULL,
  counter_id UUID REFERENCES counters(id),
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'called', 'serving', 'completed', 'cancelled', 'no_show')),
  position INTEGER DEFAULT 0,
  estimated_wait_time INTEGER DEFAULT 0, -- in minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  called_at TIMESTAMP WITH TIME ZONE,
  served_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- APPOINTMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES users(id) NOT NULL,
  industry_id UUID REFERENCES industries(id) NOT NULL,
  service_id UUID REFERENCES services(id) NOT NULL,
  counter_id UUID REFERENCES counters(id),
  staff_id UUID REFERENCES users(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Industries: Public read access
CREATE POLICY "Industries are viewable by everyone" ON industries
  FOR SELECT USING (true);

-- Users: Users can view and update their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own data" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Admins and Super Admins can view all users
CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'superadmin')
    )
  );

-- Businesses: Public read for approved businesses
CREATE POLICY "Approved businesses are viewable by everyone" ON businesses
  FOR SELECT USING (status = 'approved');

-- Super Admins can manage all businesses
CREATE POLICY "Super Admins can manage businesses" ON businesses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'superadmin'
    )
  );

-- Services: Public read access
CREATE POLICY "Services are viewable by everyone" ON services
  FOR SELECT USING (is_active = true);

-- Counters: Public read for active counters
CREATE POLICY "Active counters are viewable by everyone" ON counters
  FOR SELECT USING (status = 'active');

-- Staff can update their own counter
CREATE POLICY "Staff can update own counter" ON counters
  FOR UPDATE USING (staff_id = auth.uid());

-- Queue Tickets: Customers can view their own tickets
CREATE POLICY "Customers can view own tickets" ON queue_tickets
  FOR SELECT USING (customer_id = auth.uid());

-- Customers can create tickets
CREATE POLICY "Customers can create tickets" ON queue_tickets
  FOR INSERT WITH CHECK (customer_id = auth.uid());

-- Staff and Admins can view all tickets
CREATE POLICY "Staff can view all tickets" ON queue_tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('staff', 'admin', 'superadmin')
    )
  );

-- Staff can update tickets
CREATE POLICY "Staff can update tickets" ON queue_tickets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('staff', 'admin', 'superadmin')
    )
  );

-- Appointments: Customers can view their own appointments
CREATE POLICY "Customers can view own appointments" ON appointments
  FOR SELECT USING (customer_id = auth.uid());

-- Customers can create appointments
CREATE POLICY "Customers can create appointments" ON appointments
  FOR INSERT WITH CHECK (customer_id = auth.uid());

-- Staff and Admins can view all appointments
CREATE POLICY "Staff can view all appointments" ON appointments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('staff', 'admin', 'superadmin')
    )
  );

-- Staff can update appointments
CREATE POLICY "Staff can update appointments" ON appointments
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('staff', 'admin', 'superadmin')
    )
  );

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_counters_updated_at BEFORE UPDATE ON counters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
  ticket_num TEXT;
  counter INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO counter FROM queue_tickets
  WHERE DATE(created_at) = CURRENT_DATE;

  ticket_num := 'T' || TO_CHAR(CURRENT_DATE, 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0');
  RETURN ticket_num;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate ticket numbers
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_ticket_number_trigger
  BEFORE INSERT ON queue_tickets
  FOR EACH ROW EXECUTE FUNCTION set_ticket_number();

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_queue_tickets_customer ON queue_tickets(customer_id);
CREATE INDEX IF NOT EXISTS idx_queue_tickets_status ON queue_tickets(status);
CREATE INDEX IF NOT EXISTS idx_queue_tickets_created ON queue_tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_appointments_customer ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_counters_staff ON counters(staff_id);
CREATE INDEX IF NOT EXISTS idx_services_industry ON services(industry_id);

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Note: Run this after setting up authentication
-- You can manually insert a super admin user after creating an account
