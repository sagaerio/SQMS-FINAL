# Recent Changes Summary

## 1. ✅ Branch Locations Synchronized

**What Changed:**
- All branch locations now match between staff and customer pages
- Removed duplicate legacy branches from `businessTypes.ts`
- Added helper function `getBranchesByIndustry()` for consistent filtering

**Files Modified:**
- `/src/app/data/businessTypes.ts`

**Result:**
- Staff and customers now see the exact same branch locations for each industry
- No more confusion with mismatched addresses or phone numbers

---

## 2. ✅ Customer Demo Account Removed from Login Page

**What Changed:**
- Removed customer demo credentials from login page
- Kept the "Staff? Visit Staff Portal" message

**Files Modified:**
- `/src/app/pages/Login.tsx`

**What You'll See:**
- Login page now shows only the staff portal message
- No demo email/password displayed
- Cleaner, more professional login experience

**Before:**
```
Customer portal demo account:
Email: demo@customer.com
Password: demo123
Staff? Visit Staff Portal from the home page
```

**After:**
```
Staff? Visit Staff Portal from the home page
```

---

## 3. ✅ Supabase Admin Role Fix

**The Problem:**
When you open the Supabase dashboard → Authentication → Users → Click a user → Try to change the role in the `users` table, you might only see "customer" and "staff" in the dropdown, not "admin" or "superadmin".

**The Solution:**
Created a SQL fix file that ensures the `user_role` ENUM includes all 4 roles:
- customer
- staff
- admin
- superadmin

**How to Apply the Fix:**

1. **Open Supabase Dashboard**
   - Go to your project
   - Click on "SQL Editor" in the left sidebar

2. **Run the Fix**
   - Open the file: `FIX_USER_ROLE_ENUM.sql`
   - Copy all the contents
   - Paste into Supabase SQL Editor
   - Click "Run"

3. **Verify It Worked**
   - At the bottom of the query results, you should see:
     ```
     available_roles
     ---------------
     customer
     staff
     admin
     superadmin
     ```

4. **Refresh Supabase UI**
   - Go back to Table Editor → users table
   - Click on any user's role field
   - You should now see all 4 options in the dropdown!

**If You Get an Error:**
- If you see "enum value already exists" - that's actually GOOD! It means the values are already there.
- Just refresh your browser and check the dropdown again.

**Alternative Method (Nuclear Option - Only if the above fails):**
If the friendly method doesn't work, there's a commented-out section in the SQL file that drops and recreates the enum. **Only use this if you have no production data**, as it will require updating all existing records.

---

## 4. ✅ Real-Time Ticket Updates (From Previous Session)

**Already Working:**
- When customers create tickets, they appear instantly on staff dashboards
- No page refresh needed
- Staff see customer name, email, service, and wait time in real-time

**Files Involved:**
- `/src/app/pages/StaffDashboard.tsx`
- `/src/hooks/useRealtimeQueue.ts`

---

## Testing Your Changes

### Test 1: Branch Locations Match
1. Login as customer
2. Go to Services → Select industry → Select service
3. Note the branch addresses
4. Login as staff for same industry
5. Check appointments/queue pages
6. ✅ Verify branch addresses are identical

### Test 2: Login Page
1. Go to `/login`
2. ✅ Verify no demo credentials are shown
3. ✅ Verify "Staff? Visit Staff Portal" message is still there

### Test 3: Supabase Admin Role
1. Run `FIX_USER_ROLE_ENUM.sql` in Supabase
2. Go to Table Editor → users
3. Click on any user's role field
4. ✅ Verify dropdown shows: customer, staff, admin, superadmin
5. Select "admin" for a test user
6. Login as that user
7. ✅ Verify they can access `/admin` page

### Test 4: Real-Time Tickets
1. Login as customer (one browser)
2. Login as staff (another browser/incognito)
3. Customer: Create a new ticket
4. Staff: ✅ Watch ticket appear immediately without refresh!

---

## Quick Command Reference

**To set a user as admin in Supabase:**
```sql
UPDATE users 
SET role = 'admin',
    industry_id = 'banking'  -- or healthcare, retail, etc.
WHERE email = 'your-email@example.com';
```

**To set a user as superadmin:**
```sql
UPDATE users 
SET role = 'superadmin'
WHERE email = 'your-email@example.com';
```

**To verify role options exist:**
```sql
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = 'user_role'::regtype 
ORDER BY enumsortorder;
```

---

All changes are complete and ready to test! 🎉
