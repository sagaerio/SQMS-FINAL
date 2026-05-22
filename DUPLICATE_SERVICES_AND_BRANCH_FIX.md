# Duplicate Services & Branch Location Fix - Complete Solution

## Issues Identified

### 1. Duplicate Services
**Problem:** Services like "Account Opening" and "Loan Inquiry" were appearing 3+ times in the customer service selection.

**Root Cause:** The Supabase `services` table contains duplicate entries with the same name within the same industry.

### 2. Branch Location Mismatch
**Problem:** Staff member "saga 4" is assigned to "Manhattan Financial Center" branch, but this branch doesn't appear in the customer branch selection.

**Root Cause:** The staff member's `industry_id` doesn't match the branch's `industry_id` in the database, causing the branch to be filtered out when customers select their industry.

---

## Fixes Implemented

### ✅ Code-Level Fixes (Already Done)

#### 1. **Deduplication at Query Level** (`src/services/queueService.ts:240`)
```typescript
export const getServicesByIndustry = async (industryId: string) => {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('industry_id', industryId)
    .eq('is_active', true)
    .order('name', { ascending: true });

  // Remove duplicates by keeping only first occurrence of each unique service name
  if (data) {
    const seen = new Set<string>();
    const uniqueData = data.filter(service => {
      if (seen.has(service.name)) return false;
      seen.add(service.name);
      return true;
    });
    return { data: uniqueData, error: null };
  }
}
```
This ensures that even if the database has duplicates, the API will only return unique services.

#### 2. **Branch Industry Validation** (`src/app/pages/EmployeeManagement.tsx:163`)
```typescript
const handleSaveBranchAssignment = async () => {
  // Validate that the selected branch belongs to the staff's industry
  const staff = employees.find(e => e.id === managingStaffId);
  const selectedBranch = branches.find(b => b.id === selectedBranchId);

  if (staff && selectedBranch && staff.industry_id !== selectedBranch.industry_id) {
    alert(`Cannot assign this branch. Staff industry must match branch industry.`);
    return;
  }
  // ... proceed with assignment
}
```
This prevents admins from assigning staff to branches that don't match their industry.

#### 3. **UI Warning for Missing Branches** (`src/app/pages/EmployeeManagement.tsx:411`)
Added a warning message when no branches are available for a staff member's industry.

---

## Database Cleanup Required

### Step 1: Identify Data Issues

Run the diagnostic queries in `FIX_DATA_ISSUES.sql` to see what needs to be fixed:

```bash
# In Supabase SQL Editor, run:
# FIX_DATA_ISSUES.sql (sections 1 and 3)
```

This will show you:
- **Duplicate services:** Services with the same name appearing multiple times
- **Mismatched branches:** Staff assigned to branches in different industries

### Step 2: Review the Issues

**Example Output:**

```
Duplicate Services:
industry_id  | name                  | duplicate_count | service_ids
-------------|----------------------|-----------------|---------------------------
banking      | Account Opening       | 3               | uuid1, uuid2, uuid3
banking      | Loan Inquiry          | 3               | uuid4, uuid5, uuid6

Mismatched Branches:
user_id | full_name | user_industry | branch_name              | branch_industry
--------|-----------|---------------|--------------------------|----------------
uuid-x  | saga 4    | banking       | Manhattan Financial Ctr  | retail
```

### Step 3: Fix the Issues

#### Option A: Automated Fix (Recommended)

Uncomment and run the cleanup sections in `FIX_DATA_ISSUES.sql`:

```sql
-- Delete duplicate services (keeps oldest)
-- Uncomment section "PART 2"

-- Clear mismatched branch assignments
-- Uncomment section "PART 4"
```

#### Option B: Manual Fix

**For Duplicate Services:**
1. Go to Supabase Table Editor → `services` table
2. Filter by `industry_id = 'banking'` and `name = 'Account Opening'`
3. Delete the duplicate entries (keep only one)
4. Repeat for all duplicate services

**For Mismatched Branches:**
1. Go to Supabase Table Editor → `users` table
2. Find user "saga 4" (or run the mismatch query)
3. Either:
   - Clear their `branch_id` (set to NULL), OR
   - Assign them to a branch that matches their `industry_id`

### Step 4: Verify the Fix

Run the verification queries (Part 5 of `FIX_DATA_ISSUES.sql`):

```sql
-- Check services have no duplicates
SELECT industry_id, COUNT(DISTINCT name) as unique_services, COUNT(*) as total_services
FROM services WHERE is_active = true GROUP BY industry_id;
-- unique_services should equal total_services

-- Check all staff have matching branches
SELECT ... FROM users u JOIN businesses b ...
-- mismatched_industries should be 0
```

---

## Testing After Fix

### Test 1: No More Duplicate Services
1. **As Customer:** Go to Services → Select "Banking & Finance"
2. **Verify:** Each service appears only once (no "Account Opening" x3)

### Test 2: Staff Branch Appears for Customers
1. **Fix the data:** Ensure "saga 4" is assigned to a branch with `industry_id = 'banking'`
2. **As Customer:** Go to Services → Select "Banking & Finance" → Select any service
3. **Verify:** The branch "Manhattan Financial Center" (or whatever saga 4's branch is) appears in the list
4. **As Admin:** Go to Employee Management → Click Settings for "saga 4"
5. **Verify:** The same branches appear in the dropdown

### Test 3: Cannot Assign Mismatched Branches
1. **As Admin:** Go to Employee Management
2. **Click Settings** for a "Banking" staff member
3. **Try to assign** a "Healthcare" or "Retail" branch
4. **Verify:** You get an error: "Cannot assign this branch. Staff industry must match branch industry."

---

## How It Works Now

### Customer Journey
1. Customer selects industry (e.g., "Banking & Finance")
2. `getServicesByIndustry('banking')` returns deduplicated services
3. Customer sees each service only once
4. `getBusinessesByIndustry('banking')` returns branches with `industry_id = 'banking'`
5. Customer sees all banking branches (same ones staff are assigned to)

### Staff Management Journey
1. Admin selects a staff member (e.g., "saga 4" in "Banking")
2. `loadIndustryData('banking')` loads branches and services for banking industry only
3. Admin can only assign branches that match the staff's industry
4. Validation prevents mismatched assignments

### Real-Time Sync
- Staff assignments use `getBusinessesByIndustry('banking')`
- Customer selections use `getBusinessesByIndustry('banking')`
- **Both see the exact same branches** from the database

---

## Summary of Changes

| File | Change |
|------|--------|
| `src/services/queueService.ts` | Added deduplication logic to `getServicesByIndustry()` |
| `src/app/components/ServiceSelection.tsx` | Removed redundant client-side deduplication |
| `src/app/pages/Services.tsx` | Removed redundant client-side deduplication |
| `src/app/pages/EmployeeManagement.tsx` | Added branch-industry validation + warning UI |
| `FIX_DATA_ISSUES.sql` | New SQL script to identify and fix data issues |

---

## Next Steps

1. ✅ Code changes are complete (already applied)
2. ⚠️ **YOU NEED TO:** Run `FIX_DATA_ISSUES.sql` in Supabase SQL Editor
3. ⚠️ **YOU NEED TO:** Review and fix duplicate services and mismatched branches
4. ✅ Test the application to verify fixes work

---

## Prevention Going Forward

The code now prevents:
- ✅ Duplicate services from appearing in UI (deduplication at query level)
- ✅ Staff being assigned to branches in different industries (validation)
- ✅ Empty branch lists (warning message shown)

But you should still:
- 🔍 Periodically audit your Supabase data for duplicates
- 🔍 Ensure all new branches have correct `industry_id`
- 🔍 Ensure all new services are unique within their industry
