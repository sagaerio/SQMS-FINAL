-- =====================================================
-- DETAILED DEMO DATA FOR SQMS
-- =====================================================
-- Run this AFTER you've created your first user account
-- This will populate your system with realistic demo data
-- =====================================================

-- =====================================================
-- STEP 1: CREATE DEMO CUSTOMER ACCOUNTS
-- =====================================================
-- Note: These users need to be created in auth.users first
-- For now, we'll create the user profile entries
-- You'll need to create the actual auth accounts through the app

-- Demo customers will be created when they sign up through the app
-- But we can prepare some sample ticket and appointment data

-- =====================================================
-- STEP 2: CREATE DEMO STAFF ACCOUNTS
-- =====================================================
-- Banking Staff (Counter 1)
-- Email: staff.banking@demo.com | Password: Demo123!
-- After creating this account through your app, run:
-- UPDATE users SET role = 'staff', industry_id = 'banking', counter_id = 'c1111111-1111-1111-1111-111111111111'
-- WHERE email = 'staff.banking@demo.com';

-- Healthcare Staff (Reception 1)
-- Email: staff.healthcare@demo.com | Password: Demo123!
-- After creating: UPDATE users SET role = 'staff', industry_id = 'healthcare', counter_id = 'c2222222-2222-2222-2222-222222222221'
-- WHERE email = 'staff.healthcare@demo.com';

-- Retail Staff (Customer Service)
-- Email: staff.retail@demo.com | Password: Demo123!
-- After creating: UPDATE users SET role = 'staff', industry_id = 'retail', counter_id = 'c3333333-3333-3333-3333-333333333331'
-- WHERE email = 'staff.retail@demo.com';

-- Government Staff (Window 1)
-- Email: staff.government@demo.com | Password: Demo123!
-- After creating: UPDATE users SET role = 'staff', industry_id = 'government', counter_id = 'c4444444-4444-4444-4444-444444444441'
-- WHERE email = 'staff.government@demo.com';

-- Education Staff (Admissions)
-- Email: staff.education@demo.com | Password: Demo123!
-- After creating: UPDATE users SET role = 'staff', industry_id = 'education', counter_id = 'c5555555-5555-5555-5555-555555555551'
-- WHERE email = 'staff.education@demo.com';

-- Corporate Staff (HR Desk)
-- Email: staff.corporate@demo.com | Password: Demo123!
-- After creating: UPDATE users SET role = 'staff', industry_id = 'corporate', counter_id = 'c6666666-6666-6666-6666-666666666661'
-- WHERE email = 'staff.corporate@demo.com';

-- =====================================================
-- STEP 3: CREATE DEMO ADMIN ACCOUNTS
-- =====================================================
-- Banking Admin
-- Email: admin.banking@demo.com | Password: Demo123!
-- After creating: UPDATE users SET role = 'admin', industry_id = 'banking', business_id = 'b1111111-1111-1111-1111-111111111111'
-- WHERE email = 'admin.banking@demo.com';

-- Healthcare Admin
-- Email: admin.healthcare@demo.com | Password: Demo123!
-- After creating: UPDATE users SET role = 'admin', industry_id = 'healthcare', business_id = 'b2222222-2222-2222-2222-222222222222'
-- WHERE email = 'admin.healthcare@demo.com';

-- Retail Admin
-- Email: admin.retail@demo.com | Password: Demo123!
-- After creating: UPDATE users SET role = 'admin', industry_id = 'retail', business_id = 'b3333333-3333-3333-3333-333333333333'
-- WHERE email = 'admin.retail@demo.com';

-- Government Admin
-- Email: admin.government@demo.com | Password: Demo123!
-- After creating: UPDATE users SET role = 'admin', industry_id = 'government', business_id = 'b4444444-4444-4444-4444-444444444444'
-- WHERE email = 'admin.government@demo.com';

-- Education Admin
-- Email: admin.education@demo.com | Password: Demo123!
-- After creating: UPDATE users SET role = 'admin', industry_id = 'education', business_id = 'b5555555-5555-5555-5555-555555555555'
-- WHERE email = 'admin.education@demo.com';

-- Corporate Admin
-- Email: admin.corporate@demo.com | Password: Demo123!
-- After creating: UPDATE users SET role = 'admin', industry_id = 'corporate', business_id = 'b6666666-6666-6666-6666-666666666666'
-- WHERE email = 'admin.corporate@demo.com';

-- =====================================================
-- STEP 4: ASSIGN STAFF TO COUNTERS
-- =====================================================
-- This will link staff members to their counters
-- Run this AFTER creating the staff accounts above

-- Banking Counter Assignment
DO $$
DECLARE
  staff_user_id UUID;
BEGIN
  SELECT id INTO staff_user_id FROM users WHERE email = 'staff.banking@demo.com';
  IF staff_user_id IS NOT NULL THEN
    UPDATE counters SET staff_id = staff_user_id
    WHERE id = 'c1111111-1111-1111-1111-111111111111';
  END IF;
END $$;

-- Healthcare Counter Assignment
DO $$
DECLARE
  staff_user_id UUID;
BEGIN
  SELECT id INTO staff_user_id FROM users WHERE email = 'staff.healthcare@demo.com';
  IF staff_user_id IS NOT NULL THEN
    UPDATE counters SET staff_id = staff_user_id
    WHERE id = 'c2222222-2222-2222-2222-222222222221';
  END IF;
END $$;

-- Retail Counter Assignment
DO $$
DECLARE
  staff_user_id UUID;
BEGIN
  SELECT id INTO staff_user_id FROM users WHERE email = 'staff.retail@demo.com';
  IF staff_user_id IS NOT NULL THEN
    UPDATE counters SET staff_id = staff_user_id
    WHERE id = 'c3333333-3333-3333-3333-333333333331';
  END IF;
END $$;

-- Government Counter Assignment
DO $$
DECLARE
  staff_user_id UUID;
BEGIN
  SELECT id INTO staff_user_id FROM users WHERE email = 'staff.government@demo.com';
  IF staff_user_id IS NOT NULL THEN
    UPDATE counters SET staff_id = staff_user_id
    WHERE id = 'c4444444-4444-4444-4444-444444444441';
  END IF;
END $$;

-- Education Counter Assignment
DO $$
DECLARE
  staff_user_id UUID;
BEGIN
  SELECT id INTO staff_user_id FROM users WHERE email = 'staff.education@demo.com';
  IF staff_user_id IS NOT NULL THEN
    UPDATE counters SET staff_id = staff_user_id
    WHERE id = 'c5555555-5555-5555-5555-555555555551';
  END IF;
END $$;

-- Corporate Counter Assignment
DO $$
DECLARE
  staff_user_id UUID;
BEGIN
  SELECT id INTO staff_user_id FROM users WHERE email = 'staff.corporate@demo.com';
  IF staff_user_id IS NOT NULL THEN
    UPDATE counters SET staff_id = staff_user_id
    WHERE id = 'c6666666-6666-6666-6666-666666666661';
  END IF;
END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check all data counts
SELECT
  (SELECT COUNT(*) FROM industries) as industries,
  (SELECT COUNT(*) FROM services) as services,
  (SELECT COUNT(*) FROM businesses) as businesses,
  (SELECT COUNT(*) FROM counters) as counters,
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM queue_tickets) as tickets,
  (SELECT COUNT(*) FROM appointments) as appointments;

-- View all businesses with details
SELECT
  b.name as business_name,
  b.industry_id,
  b.status,
  b.address,
  b.phone,
  COUNT(c.id) as counter_count
FROM businesses b
LEFT JOIN counters c ON b.id = c.business_id
GROUP BY b.id, b.name, b.industry_id, b.status, b.address, b.phone
ORDER BY b.industry_id;

-- View all counters with staff assignments
SELECT
  c.name as counter_name,
  b.name as business_name,
  c.industry_id,
  c.status,
  u.full_name as assigned_staff,
  u.email as staff_email,
  ARRAY_LENGTH(c.service_ids, 1) as service_count
FROM counters c
JOIN businesses b ON c.business_id = b.id
LEFT JOIN users u ON c.staff_id = u.id
ORDER BY c.industry_id, c.name;

-- View all services by industry
SELECT
  industry_id,
  name,
  description,
  estimated_time,
  is_active
FROM services
ORDER BY industry_id, name;

-- View all users by role
SELECT
  full_name,
  email,
  role,
  industry_id,
  created_at
FROM users
ORDER BY role, industry_id;

-- =====================================================
-- DEMO ACCOUNT CREATION GUIDE
-- =====================================================

/*
TO COMPLETE YOUR DEMO SETUP:

1. CREATE DEMO ACCOUNTS (through your app's signup page):

   STAFF ACCOUNTS (one per industry):
   - staff.banking@demo.com / Demo123!
   - staff.healthcare@demo.com / Demo123!
   - staff.retail@demo.com / Demo123!
   - staff.government@demo.com / Demo123!
   - staff.education@demo.com / Demo123!
   - staff.corporate@demo.com / Demo123!

   ADMIN ACCOUNTS (one per industry):
   - admin.banking@demo.com / Demo123!
   - admin.healthcare@demo.com / Demo123!
   - admin.retail@demo.com / Demo123!
   - admin.government@demo.com / Demo123!
   - admin.education@demo.com / Demo123!
   - admin.corporate@demo.com / Demo123!

   CUSTOMER ACCOUNTS (for testing):
   - customer1@demo.com / Demo123!
   - customer2@demo.com / Demo123!
   - customer3@demo.com / Demo123!

2. UPDATE ROLES IN SUPABASE:
   After creating each account, go to Table Editor → users and update:

   For staff accounts:
   - role = 'staff'
   - industry_id = their industry (banking, healthcare, etc.)
   - counter_id = their counter ID (see counter IDs in verification queries above)

   For admin accounts:
   - role = 'admin'
   - industry_id = their industry
   - business_id = their business ID (see business IDs in verification queries above)

3. RE-RUN THIS FILE to assign staff to counters

4. TEST THE SYSTEM:
   - Sign in as a customer and join a queue
   - Sign in as staff and manage the queue
   - Sign in as admin and view analytics

*/

-- =====================================================
-- QUICK ROLE UPDATE EXAMPLES
-- =====================================================

-- Example: Make a user a banking staff member
-- UPDATE users
-- SET role = 'staff',
--     industry_id = 'banking',
--     counter_id = 'c1111111-1111-1111-1111-111111111111'
-- WHERE email = 'staff.banking@demo.com';

-- Example: Make a user a healthcare admin
-- UPDATE users
-- SET role = 'admin',
--     industry_id = 'healthcare',
--     business_id = 'b2222222-2222-2222-2222-222222222222'
-- WHERE email = 'admin.healthcare@demo.com';

-- Example: Make a user a superadmin (full system access)
-- UPDATE users
-- SET role = 'superadmin'
-- WHERE email = 'your-email@example.com';
