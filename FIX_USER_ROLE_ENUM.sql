-- =====================================================
-- FIX USER ROLE ENUM TO INCLUDE ADMIN AND SUPERADMIN
-- =====================================================
-- Run this in Supabase SQL Editor if you can't see
-- admin/superadmin options in the role dropdown
-- =====================================================

-- Check if user_role type exists and alter it to include all roles
DO $$
BEGIN
  -- First, check if the type exists
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    -- Add missing enum values if they don't exist
    -- Note: You cannot remove enum values, only add new ones

    -- Try to add 'admin' if it doesn't exist
    BEGIN
      ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';
    EXCEPTION
      WHEN duplicate_object THEN null;
    END;

    -- Try to add 'superadmin' if it doesn't exist
    BEGIN
      ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'superadmin';
    EXCEPTION
      WHEN duplicate_object THEN null;
    END;

    RAISE NOTICE 'user_role enum updated successfully';
  ELSE
    -- Create the enum type if it doesn't exist
    CREATE TYPE user_role AS ENUM ('customer', 'staff', 'admin', 'superadmin');
    RAISE NOTICE 'user_role enum created';
  END IF;
END $$;

-- If the above doesn't work (due to existing enum being used), use this alternative:
-- This drops and recreates the enum (WARNING: Only safe if no production data)

-- UNCOMMENT THE BLOCK BELOW ONLY IF THE ABOVE FAILS AND YOU HAVE NO PRODUCTION DATA

/*
-- Step 1: Drop the existing type (this will fail if it's in use)
-- DROP TYPE IF EXISTS user_role CASCADE;

-- Step 2: Recreate with all values
-- CREATE TYPE user_role AS ENUM ('customer', 'staff', 'admin', 'superadmin');

-- Step 3: Update the users table to use the new enum
-- ALTER TABLE users
--   ALTER COLUMN role TYPE user_role
--   USING role::text::user_role;
*/

-- Verify the enum values
SELECT enumlabel as available_roles
FROM pg_enum
WHERE enumtypid = 'user_role'::regtype
ORDER BY enumsortorder;

-- If you see an error like "enum value already exists" or similar,
-- it means the values are already there and you're good to go!
-- Just refresh your Supabase dashboard to see the dropdown options.
