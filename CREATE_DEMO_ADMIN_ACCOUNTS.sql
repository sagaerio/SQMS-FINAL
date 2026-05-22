-- =====================================================
-- CREATE DEMO ADMIN AND SUPERADMIN ACCOUNTS
-- =====================================================
-- Run this in Supabase SQL Editor to create demo accounts
-- that you can login with
-- =====================================================

-- NOTE: You need to create these accounts in TWO places:
-- 1. In auth.users (for authentication)
-- 2. In public.users (for profile/role data)

-- Since we can't directly insert into auth.users via SQL,
-- you have TWO OPTIONS:

-- =====================================================
-- OPTION 1: CREATE VIA SUPABASE DASHBOARD (RECOMMENDED)
-- =====================================================
-- 1. Go to Authentication → Users → Add User
-- 2. Create each account with these credentials:

-- SUPERADMIN ACCOUNT:
--    Email: superadmin@sqms.com
--    Password: super123
--    Auto Confirm User: ✅ YES

-- ADMIN ACCOUNTS (create one for each industry):
--    Banking Admin:
--      Email: admin.banking@sqms.com
--      Password: admin123
--      Auto Confirm User: ✅ YES
--
--    Healthcare Admin:
--      Email: admin.healthcare@sqms.com
--      Password: admin123
--      Auto Confirm User: ✅ YES
--
--    Retail Admin:
--      Email: admin.retail@sqms.com
--      Password: admin123
--      Auto Confirm User: ✅ YES
--
--    Government Admin:
--      Email: admin.government@sqms.com
--      Password: admin123
--      Auto Confirm User: ✅ YES
--
--    Education Admin:
--      Email: admin.education@sqms.com
--      Password: admin123
--      Auto Confirm User: ✅ YES
--
--    Corporate Admin:
--      Email: admin.corporate@sqms.com
--      Password: admin123
--      Auto Confirm User: ✅ YES

-- 3. After creating each account in Authentication,
--    copy the UUID from the Users list
-- 4. Run the SQL below to create their profiles

-- =====================================================
-- OPTION 2: USE SUPABASE ADMIN API (ADVANCED)
-- =====================================================
-- If you have admin access, you can use this approach:

-- First, enable the RPC function to create auth users:
CREATE OR REPLACE FUNCTION create_demo_admin_user(
  user_email TEXT,
  user_password TEXT,
  user_full_name TEXT,
  user_role user_role,
  user_industry TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_user_id UUID;
BEGIN
  -- This requires admin privileges
  -- Insert into auth.users (this is a simplified version)
  -- In practice, you should use Supabase Dashboard or Admin API

  -- For now, we'll just prepare the profile
  -- You still need to create the auth user manually

  RAISE NOTICE 'Please create auth user manually with email: %', user_email;
  RAISE NOTICE 'Then run the profile creation SQL with their UUID';

  RETURN NULL;
END;
$$;

-- =====================================================
-- STEP 1: CREATE PROFILES (Run after creating auth users)
-- =====================================================

-- IMPORTANT: Replace the UUIDs below with the actual UUIDs
-- from the auth.users table after you create them in the dashboard

-- Superadmin Profile
INSERT INTO users (id, email, full_name, role, industry_id, business_id, counter_id)
VALUES (
  'REPLACE-WITH-SUPERADMIN-UUID'::uuid,  -- Replace this!
  'superadmin@sqms.com',
  'Super Admin',
  'superadmin',
  NULL,  -- Superadmin has access to all industries
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE
SET role = 'superadmin',
    full_name = 'Super Admin',
    email = 'superadmin@sqms.com';

-- Banking Admin Profile
INSERT INTO users (id, email, full_name, role, industry_id, business_id, counter_id)
VALUES (
  'REPLACE-WITH-BANKING-ADMIN-UUID'::uuid,  -- Replace this!
  'admin.banking@sqms.com',
  'Banking & Finance Admin',
  'admin',
  'banking',
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin',
    industry_id = 'banking',
    full_name = 'Banking & Finance Admin',
    email = 'admin.banking@sqms.com';

-- Healthcare Admin Profile
INSERT INTO users (id, email, full_name, role, industry_id, business_id, counter_id)
VALUES (
  'REPLACE-WITH-HEALTHCARE-ADMIN-UUID'::uuid,  -- Replace this!
  'admin.healthcare@sqms.com',
  'Healthcare Admin',
  'admin',
  'healthcare',
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin',
    industry_id = 'healthcare',
    full_name = 'Healthcare Admin',
    email = 'admin.healthcare@sqms.com';

-- Retail Admin Profile
INSERT INTO users (id, email, full_name, role, industry_id, business_id, counter_id)
VALUES (
  'REPLACE-WITH-RETAIL-ADMIN-UUID'::uuid,  -- Replace this!
  'admin.retail@sqms.com',
  'Retail Admin',
  'admin',
  'retail',
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin',
    industry_id = 'retail',
    full_name = 'Retail Admin',
    email = 'admin.retail@sqms.com';

-- Government Admin Profile
INSERT INTO users (id, email, full_name, role, industry_id, business_id, counter_id)
VALUES (
  'REPLACE-WITH-GOVERNMENT-ADMIN-UUID'::uuid,  -- Replace this!
  'admin.government@sqms.com',
  'Government Services Admin',
  'admin',
  'government',
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin',
    industry_id = 'government',
    full_name = 'Government Services Admin',
    email = 'admin.government@sqms.com';

-- Education Admin Profile
INSERT INTO users (id, email, full_name, role, industry_id, business_id, counter_id)
VALUES (
  'REPLACE-WITH-EDUCATION-ADMIN-UUID'::uuid,  -- Replace this!
  'admin.education@sqms.com',
  'Education Admin',
  'admin',
  'education',
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin',
    industry_id = 'education',
    full_name = 'Education Admin',
    email = 'admin.education@sqms.com';

-- Corporate Admin Profile
INSERT INTO users (id, email, full_name, role, industry_id, business_id, counter_id)
VALUES (
  'REPLACE-WITH-CORPORATE-ADMIN-UUID'::uuid,  -- Replace this!
  'admin.corporate@sqms.com',
  'Corporate Office Admin',
  'admin',
  'corporate',
  NULL,
  NULL
)
ON CONFLICT (id) DO UPDATE
SET role = 'admin',
    industry_id = 'corporate',
    full_name = 'Corporate Office Admin',
    email = 'admin.corporate@sqms.com';

-- =====================================================
-- STEP 2: VERIFY YOUR ACCOUNTS
-- =====================================================

-- Check auth users
SELECT id, email, created_at, confirmed_at
FROM auth.users
WHERE email LIKE '%@sqms.com'
ORDER BY email;

-- Check user profiles
SELECT id, email, full_name, role, industry_id
FROM users
WHERE email LIKE '%@sqms.com'
ORDER BY role DESC, email;

-- =====================================================
-- QUICK HELPER: Find UUIDs for created accounts
-- =====================================================

-- Run this to get the UUIDs of your newly created auth users:
SELECT
  email,
  id as uuid_to_copy,
  'INSERT INTO users (id, email, full_name, role, industry_id) VALUES (''' || id || '''::uuid, ''' || email || ''', ''NAME'', ''ROLE'', ''INDUSTRY'');' as insert_statement
FROM auth.users
WHERE email IN (
  'superadmin@sqms.com',
  'admin.banking@sqms.com',
  'admin.healthcare@sqms.com',
  'admin.retail@sqms.com',
  'admin.government@sqms.com',
  'admin.education@sqms.com',
  'admin.corporate@sqms.com'
)
ORDER BY email;

-- This will generate the INSERT statements for you with the correct UUIDs!
