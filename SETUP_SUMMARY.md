# ⚡ Quick Setup Summary

## What's New - Production-Ready Features

### 🎯 1. Enhanced Role System
- **Superadmin:** Full system access across all industries
- **Admin:** Full access to ONE industry (analytics, staff management, reports)
- **Staff:** Access only to their assigned branch + assigned services
- **Customer:** Their own data only

### 🏢 2. Branch/Location Management
- 24 real branch locations added to database
- Staff can be assigned to specific branches
- Customers choose branch when joining queue

### 🎫 3. Service Assignment System
- Staff members are assigned specific services they handle
- Staff dashboard shows ONLY tickets for their assigned services
- Admin assigns services via database

### 📊 4. Industry-Specific Administration
- Banking Admin sees only banking data
- Healthcare Admin sees only healthcare data
- Each admin has full control over their industry
- Superadmin sees everything

---

## 🚀 Setup Steps (15 Minutes)

### Step 1: Update Database (5 min)
```sql
-- In Supabase SQL Editor:
1. Copy PRODUCTION_SCHEMA_UPDATE.sql
2. Paste and run
3. Verify: SELECT COUNT(*) FROM businesses; -- Should return 24
```

### Step 2: Fix Role Enum (2 min)
```sql
-- In Supabase SQL Editor:
1. Copy FIX_USER_ROLE_ENUM.sql
2. Paste and run
3. Refresh Supabase UI
4. Check users table → role field → should see all 4 options
```

### Step 3: Create Admin Account (3 min)
```
1. Supabase Dashboard → Authentication → Users → Add User
   - Email: admin.banking@yourcompany.com
   - Password: (strong password)
   - Auto Confirm: ✅ YES

2. Copy the UUID from the users list

3. SQL Editor:
   INSERT INTO users (id, email, full_name, role, industry_id)
   VALUES (
     'paste-uuid-here',
     'admin.banking@yourcompany.com',
     'Banking Administrator',
     'admin',
     'banking'
   );

4. Login at /staff-portal with those credentials
5. ✅ You should see the admin dashboard!
```

### Step 4: Create Staff & Assign Services (5 min)
```
1. Create auth user in Supabase (same as Step 3)

2. Create profile:
   INSERT INTO users (id, email, full_name, role, industry_id, branch_id)
   VALUES (
     'staff-uuid',
     'staff.banking@yourcompany.com',
     'Sarah Johnson',
     'staff',
     'banking',
     'b1111111-1111-1111-1111-111111111111'  -- Downtown branch
   );

3. Assign services:
   -- First, get service IDs:
   SELECT id, name FROM services WHERE industry_id = 'banking';

   -- Then assign (use actual service IDs):
   INSERT INTO staff_services (staff_id, service_id)
   VALUES
     ('staff-uuid', 'service-uuid-1'),
     ('staff-uuid', 'service-uuid-2');

4. Login at /staff-portal
5. ✅ Staff dashboard shows only assigned services!
```

---

## 📋 Quick Test Checklist

### ✅ Database Setup
```sql
-- Run these queries to verify:

-- 1. Check businesses exist
SELECT COUNT(*) FROM businesses;
-- Expected: 24

-- 2. Check role enum has all values
SELECT enumlabel FROM pg_enum WHERE enumtypid = 'user_role'::regtype;
-- Expected: customer, staff, admin, superadmin

-- 3. Check staff_services table exists
SELECT COUNT(*) FROM staff_services;
-- Expected: 0 (or however many you've assigned)
```

### ✅ Admin Access
- [ ] Admin can login at /staff-portal
- [ ] Admin sees their industry dashboard
- [ ] Admin does NOT see other industries
- [ ] Admin can view analytics/reports

### ✅ Staff Access
- [ ] Staff can login at /staff-portal
- [ ] Staff sees only their assigned services
- [ ] Staff dashboard filters tickets correctly
- [ ] Real-time updates work

### ✅ Customer Flow
- [ ] Customer can join queue
- [ ] Customer selects branch location
- [ ] Ticket appears on staff dashboard immediately
- [ ] Real-time position updates work

---

## 🔑 Demo Accounts (Already Working)

These work WITHOUT any Supabase setup:

### Superadmin
```
Email: superadmin@sqms.com
Password: super123
```

### Industry Admins
```
Banking:    admin.banking@sqms.com     / admin123
Healthcare: admin.healthcare@sqms.com  / admin123
Retail:     admin.retail@sqms.com      / admin123
Government: admin.government@sqms.com  / admin123
Education:  admin.education@sqms.com   / admin123
Corporate:  admin.corporate@sqms.com   / admin123
```

### Staff
```
Banking:    staff.banking@sqms.com     / banking123
Healthcare: staff.healthcare@sqms.com  / healthcare123
Retail:     staff.retail@sqms.com      / retail123
Government: staff.government@sqms.com  / government123
Education:  staff.education@sqms.com   / education123
Corporate:  staff.corporate@sqms.com   / corporate123
```

---

## 📚 Full Documentation

- **PRODUCTION_LAUNCH_GUIDE.md** - Complete production guide
- **DEMO_ACCOUNTS_LIST.md** - All demo account details
- **CREATE_DEMO_ADMIN_ACCOUNTS.sql** - Create accounts in Supabase
- **PRODUCTION_SCHEMA_UPDATE.sql** - Database schema for production
- **FIX_USER_ROLE_ENUM.sql** - Fix admin role dropdown

---

## 🎯 What Each Role Can Do

### Superadmin
- ✅ View all industries
- ✅ Manage all employees
- ✅ Approve businesses
- ✅ System-wide analytics
- ✅ Everything admins can do, but for ALL industries

### Admin (Per Industry)
- ✅ View industry analytics & reports
- ✅ Manage staff in their industry
- ✅ Assign staff to branches
- ✅ Assign services to staff
- ✅ View all tickets/appointments in their industry
- ❌ Cannot access other industries

### Staff
- ✅ View tickets for assigned services only
- ✅ Serve customers at assigned branch
- ✅ Real-time queue updates
- ❌ Cannot see other services
- ❌ Cannot access admin panel

### Customer
- ✅ Join queue
- ✅ Book appointments
- ✅ View their tickets
- ✅ Real-time position updates
- ❌ No admin access

---

## 🚨 Common Issues & Fixes

### "Can't see admin/superadmin in dropdown"
```sql
-- Run this:
-- Copy contents of FIX_USER_ROLE_ENUM.sql and execute
-- Then refresh Supabase browser tab
```

### "Staff sees all tickets, not just assigned services"
```sql
-- Check assignments:
SELECT * FROM staff_services WHERE staff_id = 'your-staff-uuid';

-- If empty, assign some:
INSERT INTO staff_services (staff_id, service_id)
VALUES ('staff-uuid', 'service-uuid');
```

### "Admin can't login"
```sql
-- Verify profile exists:
SELECT * FROM users WHERE email = 'admin.banking@yourcompany.com';

-- Should have:
-- role = 'admin'
-- industry_id = 'banking' (or their industry)
```

### "Real-time not working"
```
1. Check browser console for errors
2. Verify Supabase URL/key in src/lib/supabase.ts
3. Check RLS policies are enabled
4. Verify realtime is enabled in Supabase (PRODUCTION_SCHEMA_UPDATE.sql handles this)
```

---

## ✅ Production Ready!

Once you've completed the setup steps above:

- ✅ Admin roles work correctly
- ✅ Staff only see their services
- ✅ Real-time updates enabled
- ✅ Proper security with RLS
- ✅ 24 branch locations available
- ✅ Production-ready database schema

**Time to launch! 🎉**
