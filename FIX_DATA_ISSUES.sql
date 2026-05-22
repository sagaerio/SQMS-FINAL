-- =====================================================
-- DATA CLEANUP SCRIPT
-- =====================================================
-- This script identifies and fixes data integrity issues:
-- 1. Duplicate services with the same name
-- 2. Staff assigned to branches that don't match their industry
-- =====================================================

-- =====================================================
-- PART 1: FIND DUPLICATE SERVICES
-- =====================================================

-- View duplicate services (same name within same industry)
SELECT
  industry_id,
  name,
  COUNT(*) as duplicate_count,
  STRING_AGG(id::text, ', ') as service_ids
FROM services
WHERE is_active = true
GROUP BY industry_id, name
HAVING COUNT(*) > 1
ORDER BY industry_id, name;

-- =====================================================
-- PART 2: DELETE DUPLICATE SERVICES (KEEP OLDEST)
-- =====================================================
-- WARNING: This will delete duplicate services, keeping only the oldest one
-- Review the above query results before running this!

-- Uncomment below to execute the deletion:
/*
DELETE FROM services
WHERE id IN (
  SELECT s2.id
  FROM services s1
  JOIN services s2 ON s1.industry_id = s2.industry_id
    AND s1.name = s2.name
    AND s1.id != s2.id
    AND s1.created_at < s2.created_at
  WHERE s2.is_active = true
);
*/

-- =====================================================
-- PART 3: FIND STAFF WITH MISMATCHED BRANCHES
-- =====================================================

-- Find staff assigned to branches that don't match their industry
SELECT
  u.id as user_id,
  u.full_name,
  u.email,
  u.industry_id as user_industry,
  b.id as branch_id,
  b.name as branch_name,
  b.industry_id as branch_industry,
  'MISMATCH: User in ' || u.industry_id || ' but branch in ' || b.industry_id as issue
FROM users u
JOIN businesses b ON u.branch_id = b.id
WHERE u.branch_id IS NOT NULL
  AND u.industry_id != b.industry_id
ORDER BY u.full_name;

-- =====================================================
-- PART 4: FIX MISMATCHED BRANCH ASSIGNMENTS
-- =====================================================
-- Option A: Clear invalid branch assignments
-- This removes branch assignments where industry doesn't match

-- Uncomment below to clear mismatched branches:
/*
UPDATE users
SET branch_id = NULL
WHERE branch_id IN (
  SELECT u.branch_id
  FROM users u
  JOIN businesses b ON u.branch_id = b.id
  WHERE u.industry_id != b.industry_id
);
*/

-- =====================================================
-- PART 5: VERIFY DATA INTEGRITY
-- =====================================================

-- Check 1: Services should not have duplicates within the same industry
SELECT
  industry_id,
  COUNT(DISTINCT name) as unique_services,
  COUNT(*) as total_services
FROM services
WHERE is_active = true
GROUP BY industry_id;

-- Check 2: All staff should have branches matching their industry
SELECT
  COUNT(*) as total_staff_with_branches,
  SUM(CASE WHEN u.industry_id = b.industry_id THEN 1 ELSE 0 END) as matching_industries,
  SUM(CASE WHEN u.industry_id != b.industry_id THEN 1 ELSE 0 END) as mismatched_industries
FROM users u
JOIN businesses b ON u.branch_id = b.id
WHERE u.branch_id IS NOT NULL;

-- =====================================================
-- PART 6: VIEW BRANCHES BY INDUSTRY
-- =====================================================

-- See all active branches grouped by industry
SELECT
  i.name as industry_name,
  b.name as branch_name,
  b.address,
  b.status
FROM businesses b
JOIN industries i ON b.industry_id = i.id
WHERE b.status = 'active'
ORDER BY i.name, b.name;

-- =====================================================
-- DONE!
-- =====================================================
-- After running this script:
-- 1. Review the duplicate services and mismatched branches
-- 2. Uncomment and run the DELETE/UPDATE statements if you want to fix them
-- 3. Run the verification queries to confirm everything is correct
-- =====================================================
