-- =====================================================
-- TEST REAL STAFF LOGIN
-- =====================================================
-- Use these queries to create and verify real staff accounts

-- =====================================================
-- EXAMPLE: Create a Real Banking Staff Member
-- =====================================================

-- Step 1: First create the account through your app's sign-up page
-- Email: sarah.johnson@mybank.com
-- Password: (whatever you choose)

-- Step 2: After signup, run this to make them a staff member:
UPDATE users
SET role = 'staff',
    industry_id = 'banking',
    counter_id = 'c1111111-1111-1111-1111-111111111111',  -- Counter 1 for banking
    full_name = 'Sarah Johnson'
WHERE email = 'sarah.johnson@mybank.com';

-- Step 3: Verify it worked:
SELECT email, full_name, role, industry_id, counter_id
FROM users
WHERE email = 'sarah.johnson@mybank.com';

-- =====================================================
-- EXAMPLE: Create a Real Healthcare Admin
-- =====================================================

-- Step 1: Sign up through app
-- Email: dr.wilson@citymedical.com
-- Password: (whatever you choose)

-- Step 2: Make them an admin:
UPDATE users
SET role = 'admin',
    industry_id = 'healthcare',
    business_id = 'b2222222-2222-2222-2222-222222222222',  -- City Medical Center
    full_name = 'Dr. James Wilson'
WHERE email = 'dr.wilson@citymedical.com';

-- Step 3: Verify:
SELECT email, full_name, role, industry_id, business_id
FROM users
WHERE email = 'dr.wilson@citymedical.com';

-- =====================================================
-- EXAMPLE: Create a Superadmin
-- =====================================================

-- Step 1: Sign up through app
-- Email: your-email@company.com
-- Password: (your secure password)

-- Step 2: Make them superadmin (full access):
UPDATE users
SET role = 'superadmin',
    full_name = 'Your Name'
WHERE email = 'your-email@company.com';

-- Step 3: Verify:
SELECT email, full_name, role
FROM users
WHERE email = 'your-email@company.com';

-- =====================================================
-- VIEW ALL STAFF MEMBERS
-- =====================================================

SELECT
  full_name,
  email,
  role,
  industry_id,
  counter_id,
  business_id,
  created_at
FROM users
WHERE role IN ('staff', 'admin', 'superadmin')
ORDER BY role, industry_id;

-- =====================================================
-- VIEW STAFF WITH THEIR COUNTER DETAILS
-- =====================================================

SELECT
  u.full_name as staff_name,
  u.email,
  u.role,
  c.name as counter_name,
  b.name as business_name,
  u.industry_id
FROM users u
LEFT JOIN counters c ON u.counter_id::UUID = c.id
LEFT JOIN businesses b ON c.business_id = b.id
WHERE u.role = 'staff'
ORDER BY u.industry_id;

-- =====================================================
-- VIEW ADMINS WITH THEIR BUSINESS DETAILS
-- =====================================================

SELECT
  u.full_name as admin_name,
  u.email,
  b.name as business_name,
  b.industry_id,
  b.address,
  b.phone
FROM users u
LEFT JOIN businesses b ON u.business_id::UUID = b.id
WHERE u.role = 'admin'
ORDER BY b.industry_id;

-- =====================================================
-- QUICK REFERENCE: Counter IDs by Industry
-- =====================================================

-- Banking Counters
-- c1111111-1111-1111-1111-111111111111 (Counter 1)
-- c1111111-1111-1111-1111-111111111112 (Counter 2)
-- c1111111-1111-1111-1111-111111111113 (Counter 3)

-- Healthcare Counters
-- c2222222-2222-2222-2222-222222222221 (Reception 1)
-- c2222222-2222-2222-2222-222222222222 (Reception 2)
-- c2222222-2222-2222-2222-222222222223 (Lab Services)
-- c2222222-2222-2222-2222-222222222224 (Pharmacy)

-- Retail Counters
-- c3333333-3333-3333-3333-333333333331 (Customer Service)
-- c3333333-3333-3333-3333-333333333332 (Returns Desk)
-- c3333333-3333-3333-3333-333333333333 (Tech Support)

-- Government Counters
-- c4444444-4444-4444-4444-444444444441 (Window 1)
-- c4444444-4444-4444-4444-444444444442 (Window 2)
-- c4444444-4444-4444-4444-444444444443 (Window 3)
-- c4444444-4444-4444-4444-444444444444 (Permits Office)

-- Education Counters
-- c5555555-5555-5555-5555-555555555551 (Admissions)
-- c5555555-5555-5555-5555-555555555552 (Financial Aid)
-- c5555555-5555-5555-5555-555555555553 (Registrar)

-- Corporate Counters
-- c6666666-6666-6666-6666-666666666661 (HR Desk)
-- c6666666-6666-6666-6666-666666666662 (IT Support)
-- c6666666-6666-6666-6666-666666666663 (Facilities)

-- =====================================================
-- QUICK REFERENCE: Business IDs by Industry
-- =====================================================

-- b1111111-1111-1111-1111-111111111111 (First National Bank - banking)
-- b2222222-2222-2222-2222-222222222222 (City Medical Center - healthcare)
-- b3333333-3333-3333-3333-333333333333 (TechMart Electronics - retail)
-- b4444444-4444-4444-4444-444444444444 (City Hall Services - government)
-- b5555555-5555-5555-5555-555555555555 (State University - education)
-- b6666666-6666-6666-6666-666666666666 (Global Tech Corp - corporate)

-- =====================================================
-- CONVERT EXISTING CUSTOMER TO STAFF
-- =====================================================

-- If someone already has a customer account and you want to promote them:

-- Make customer into banking staff:
UPDATE users
SET role = 'staff',
    industry_id = 'banking',
    counter_id = 'c1111111-1111-1111-1111-111111111111'
WHERE email = 'existing.customer@email.com';

-- Make customer into admin:
UPDATE users
SET role = 'admin',
    industry_id = 'retail',
    business_id = 'b3333333-3333-3333-3333-333333333333'
WHERE email = 'existing.customer@email.com';

-- =====================================================
-- RESET USER BACK TO CUSTOMER
-- =====================================================

-- If you need to demote someone back to customer:
UPDATE users
SET role = 'customer',
    industry_id = NULL,
    counter_id = NULL,
    business_id = NULL
WHERE email = 'user@email.com';
