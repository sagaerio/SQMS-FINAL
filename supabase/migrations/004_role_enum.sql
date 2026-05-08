-- =====================================================
-- CREATE ROLE ENUM TYPE FOR DROPDOWN IN SUPABASE UI
-- =====================================================
-- This will make the role field show as a dropdown with predefined options
-- in Supabase Table Editor

-- Step 1: Create the ENUM type for user roles
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('customer', 'staff', 'admin', 'superadmin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Step 2: Alter the users table to use the ENUM type
-- First, we need to drop the existing CHECK constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Convert the role column to use the ENUM type
-- This is done safely by creating a new column, copying data, then swapping
ALTER TABLE users ADD COLUMN role_new user_role;

-- Copy existing role values to the new column
UPDATE users SET role_new = role::user_role;

-- Make the new column NOT NULL
ALTER TABLE users ALTER COLUMN role_new SET NOT NULL;

-- Drop the old column
ALTER TABLE users DROP COLUMN role;

-- Rename the new column to 'role'
ALTER TABLE users RENAME COLUMN role_new TO role;

-- =====================================================
-- VERIFICATION
-- =====================================================
-- Run this to verify the ENUM is working:
-- SELECT column_name, data_type, udt_name
-- FROM information_schema.columns
-- WHERE table_name = 'users' AND column_name = 'role';

-- You should see:
-- column_name | data_type    | udt_name
-- role        | USER-DEFINED | user_role

-- =====================================================
-- NOW IN SUPABASE TABLE EDITOR
-- =====================================================
-- When you edit a user in Table Editor → users table:
-- The 'role' field will show a dropdown with:
-- ☐ customer
-- ☐ staff
-- ☐ admin
-- ☐ superadmin
-- =====================================================
