-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- INDUSTRIES TABLE
-- =====================================================
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

-- =====================================================
-- USERS TABLE (extends Supabase auth.users)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('customer', 'staff', 'admin', 'superadmin')),
  industry_id TEXT REFERENCES industries(id),
  counter_id TEXT,
  business_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_industry ON users(industry_id);

-- =====================================================
-- SERVICES TABLE
-- =====================================================
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

-- =====================================================
-- BUSINESSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  industry_id TEXT NOT NULL REFERENCES industries(id),
  address TEXT,
  phone TEXT,
  email TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_businesses_industry ON businesses(industry_id);
CREATE INDEX IF NOT EXISTS idx_businesses_status ON businesses(status);

-- =====================================================
-- COUNTERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS counters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  industry_id TEXT NOT NULL REFERENCES industries(id),
  service_ids TEXT[] DEFAULT '{}',
  staff_id UUID REFERENCES users(id),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_break')),
  current_ticket UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_counters_industry ON counters(industry_id);
CREATE INDEX IF NOT EXISTS idx_counters_staff ON counters(staff_id);
CREATE INDEX IF NOT EXISTS idx_counters_status ON counters(status);

-- =====================================================
-- QUEUE TICKETS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS queue_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number TEXT UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  industry_id TEXT NOT NULL REFERENCES industries(id),
  service_id UUID NOT NULL REFERENCES services(id),
  counter_id UUID REFERENCES counters(id),
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'called', 'serving', 'completed', 'cancelled', 'no_show')),
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

-- =====================================================
-- APPOINTMENTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  industry_id TEXT NOT NULL REFERENCES industries(id),
  service_id UUID NOT NULL REFERENCES services(id),
  counter_id UUID REFERENCES counters(id),
  staff_id UUID REFERENCES users(id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show')),
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
-- FUNCTIONS
-- =====================================================

-- Function to generate ticket numbers
CREATE OR REPLACE FUNCTION generate_ticket_number(p_industry_id TEXT)
RETURNS TEXT AS $$
DECLARE
  v_prefix TEXT;
  v_count INTEGER;
  v_ticket_number TEXT;
BEGIN
  -- Set prefix based on industry
  v_prefix := CASE p_industry_id
    WHEN 'banking' THEN 'BNK'
    WHEN 'healthcare' THEN 'MED'
    WHEN 'retail' THEN 'RTL'
    WHEN 'government' THEN 'GOV'
    WHEN 'education' THEN 'EDU'
    WHEN 'corporate' THEN 'CRP'
    ELSE 'GEN'
  END;

  -- Get count of tickets today for this industry
  SELECT COUNT(*) INTO v_count
  FROM queue_tickets
  WHERE industry_id = p_industry_id
    AND DATE(created_at) = CURRENT_DATE;

  -- Generate ticket number
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

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_counters_updated_at BEFORE UPDATE ON counters
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public can view user profiles" ON users
  FOR SELECT USING (true);

-- Services policies (public read)
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
-- REALTIME SETUP
-- =====================================================

-- Enable realtime for queue tickets and appointments
ALTER PUBLICATION supabase_realtime ADD TABLE queue_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;
