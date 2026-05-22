# 🚀 Production Launch Guide - SQMS

This guide will help you set up SQMS for production launch with proper admin controls, staff assignments, and real-time queue management.

---

## 📋 Table of Contents

1. [Database Setup](#1-database-setup)
2. [Role Hierarchy](#2-role-hierarchy)
3. [Admin Capabilities](#3-admin-capabilities)
4. [Superadmin Capabilities](#4-superadmin-capabilities)
5. [Staff Configuration](#5-staff-configuration)
6. [How to Assign Staff](#6-how-to-assign-staff)
7. [Testing the System](#7-testing-the-system)
8. [Production Checklist](#8-production-checklist)

---

## 1. Database Setup

### Step 1: Run the Production Schema Update

```sql
-- In Supabase SQL Editor, run this file:
PRODUCTION_SCHEMA_UPDATE.sql
```

This creates:
- ✅ `businesses` table (branches/locations for each industry)
- ✅ `staff_services` table (tracks which services each staff member handles)
- ✅ `branch_id` column in `users` table (assigns staff to a location)
- ✅ 24 branch locations across all 6 industries
- ✅ Helper functions for staff management
- ✅ Row Level Security (RLS) policies

### Step 2: Fix Admin Role Enum (if needed)

```sql
-- In Supabase SQL Editor, run this file:
FIX_USER_ROLE_ENUM.sql
```

This ensures you can select `admin` and `superadmin` in the Supabase UI dropdown.

---

## 2. Role Hierarchy

### 🔴 Superadmin (System-Wide Access)
- **Scope:** ALL industries
- **Can access:** Everything across all industries
- **Use case:** System owner, master admin

### 🟢 Admin (Industry-Specific Access)  
- **Scope:** SINGLE industry
- **Can access:** All data, staff, branches within their industry
- **Use case:** Banking manager, Healthcare director, Retail supervisor

### 🔵 Staff (Counter/Service-Specific Access)
- **Scope:** Assigned branch + assigned services
- **Can access:** Only queue tickets for their services at their branch
- **Use case:** Frontline workers serving customers

### ⚪ Customer (Public Access)
- **Scope:** Their own data only
- **Can access:** Their tickets, appointments, queue status
- **Use case:** End users of the system

---

## 3. Admin Capabilities

### What Admins Can Do (For Their Industry):

#### ✅ View Analytics & Reports
- Total tickets processed
- Average wait times
- Service utilization
- Staff performance
- Branch performance
- Real-time queue status

#### ✅ Manage Staff
- Add new staff members
- Assign staff to branches
- Assign services to staff
- View staff assignments
- Update staff roles

#### ✅ Manage Services
- View all services in their industry
- See service utilization
- Monitor service wait times

#### ✅ Manage Branches
- View all branches in their industry
- See branch performance metrics

#### ✅ View Queue & Appointments
- See all tickets in their industry
- See all appointments in their industry
- Monitor real-time queue status

### What Admins CANNOT Do:
- ❌ Access other industries
- ❌ Create/delete industries
- ❌ Manage other admins
- ❌ Change system settings

---

## 4. Superadmin Capabilities

### What Superadmins Can Do:

#### ✅ Everything Admins Can Do, But for ALL Industries
- View analytics across all industries
- Manage staff in any industry
- Access any branch
- View all tickets and appointments

#### ✅ Plus Additional Powers:
- Create/manage industry admins
- Add employees to any industry
- Approve business registrations
- View system-wide reports
- Access superadmin dashboard
- Manage all businesses

---

## 5. Staff Configuration

### How Staff Assignments Work

Each staff member has:

1. **Assigned Industry** (`industry_id`)
   - Example: `banking`, `healthcare`, `retail`

2. **Assigned Branch** (`branch_id`)
   - Example: "First National Bank - Downtown"
   - Staff can only serve customers at this location

3. **Assigned Services** (`staff_services` table)
   - Example: ["Account Opening", "Loan Inquiry", "General Inquiry"]
   - Staff only sees tickets for these services

### Example Staff Assignment:

```
Staff Member: Sarah Johnson
Email: sarah.johnson@bank.com
Role: staff
Industry: banking
Branch: First National Bank - Downtown
Assigned Services:
  - Account Opening
  - Loan Inquiry  
  - Card Services
```

**Result:** Sarah will only see queue tickets for Account Opening, Loan Inquiry, and Card Services at the Downtown branch.

---

## 6. How to Assign Staff

### Option 1: Via Supabase Dashboard (Manual)

#### Step 1: Assign Staff to a Branch

1. Go to Table Editor → `users`
2. Find the staff member
3. Click their `branch_id` field
4. Select a branch from the dropdown
5. Save

**SQL Version:**
```sql
-- Get branch IDs first
SELECT id, name, industry_id FROM businesses WHERE industry_id = 'banking';

-- Assign staff to branch
UPDATE users
SET branch_id = 'b1111111-1111-1111-1111-111111111111'  -- Downtown branch
WHERE email = 'sarah.johnson@bank.com';
```

#### Step 2: Assign Services to Staff

**SQL:**
```sql
-- Get service IDs first
SELECT id, name FROM services WHERE industry_id = 'banking';

-- Assign service to staff (get staff ID first)
SELECT id FROM users WHERE email = 'sarah.johnson@bank.com';

-- Insert assignments
INSERT INTO staff_services (staff_id, service_id)
VALUES
  ('staff-uuid-here', 'service-uuid-1'),
  ('staff-uuid-here', 'service-uuid-2'),
  ('staff-uuid-here', 'service-uuid-3');
```

### Option 2: Via Admin Panel (Coming in UI Update)

Future admin panel will have:
- Click staff member
- Select branch from dropdown
- Check boxes for services they handle
- Save → Automatically updates database

---

## 7. Testing the System

### Test Scenario 1: Admin Login

```
1. Create admin account in Supabase:
   - Go to Authentication → Users → Add User
   - Email: admin.banking@company.com
   - Password: (strong password)
   - Auto Confirm: ✅

2. Create profile:
   UPDATE users
   SET role = 'admin',
       industry_id = 'banking',
       full_name = 'Banking Admin'
   WHERE email = 'admin.banking@company.com';

3. Login at /staff-portal
   - Should see admin dashboard
   - Should see banking analytics
   - Should NOT see healthcare, retail, etc.
```

### Test Scenario 2: Superadmin Login

```
1. Create superadmin account
2. Set role = 'superadmin' (no industry_id needed)
3. Login at /staff-portal
4. Should see:
   - All industries
   - All businesses
   - All employees
   - System-wide analytics
```

### Test Scenario 3: Staff with Service Assignment

```
1. Create staff account
2. Assign to branch:
   UPDATE users SET branch_id = 'branch-uuid' WHERE id = 'staff-uuid';
   
3. Assign services:
   INSERT INTO staff_services (staff_id, service_id)
   VALUES ('staff-uuid', 'service-uuid-1'),
          ('staff-uuid', 'service-uuid-2');

4. Login at /staff-portal
5. Go to Staff Dashboard
6. Should only see tickets for assigned services
```

### Test Scenario 4: Real-Time Queue

```
1. Open staff dashboard in one browser
2. Open customer page in another browser (incognito)
3. Customer creates a ticket
4. Staff dashboard updates IMMEDIATELY
5. No page refresh needed! ✨
```

---

## 8. Production Checklist

### Before Launch:

#### Database
- [ ] Run `PRODUCTION_SCHEMA_UPDATE.sql`
- [ ] Run `FIX_USER_ROLE_ENUM.sql`
- [ ] Verify all 24 branches were created
- [ ] Verify RLS policies are enabled
- [ ] Test real-time subscriptions work

#### Accounts
- [ ] Create real admin accounts (not demo)
- [ ] Assign admins to industries
- [ ] Create real staff accounts
- [ ] Assign staff to branches
- [ ] Assign services to staff
- [ ] Test login for each role

#### Security
- [ ] Change demo passwords
- [ ] Enable email verification
- [ ] Set up password reset
- [ ] Review RLS policies
- [ ] Test that staff can't see other industries

#### Features
- [ ] Test customer ticket creation
- [ ] Test real-time updates
- [ ] Test staff dashboard filtering
- [ ] Test admin analytics
- [ ] Test superadmin access

#### Data
- [ ] Remove demo data (if desired)
- [ ] Verify services are loaded
- [ ] Verify branches are correct
- [ ] Verify industry data is complete

---

## 9. Quick Reference: SQL Snippets

### Create Admin for Banking
```sql
-- After creating auth user in dashboard, get their UUID
SELECT id FROM auth.users WHERE email = 'admin.banking@company.com';

-- Create profile
INSERT INTO users (id, email, full_name, role, industry_id)
VALUES (
  'uuid-from-above',
  'admin.banking@company.com',
  'Banking Administrator',
  'admin',
  'banking'
);
```

### Create Superadmin
```sql
INSERT INTO users (id, email, full_name, role)
VALUES (
  'uuid-from-auth',
  'superadmin@company.com',
  'System Administrator',
  'superadmin'
);
-- Note: No industry_id needed for superadmin
```

### Assign Staff to Branch
```sql
-- List branches
SELECT id, name FROM businesses WHERE industry_id = 'banking';

-- Assign
UPDATE users
SET branch_id = 'selected-branch-uuid'
WHERE id = 'staff-uuid';
```

### Assign Multiple Services to Staff
```sql
-- Get service IDs
SELECT id, name FROM services WHERE industry_id = 'banking';

-- Assign multiple services at once
INSERT INTO staff_services (staff_id, service_id)
VALUES
  ('staff-uuid', 'service-uuid-1'),
  ('staff-uuid', 'service-uuid-2'),
  ('staff-uuid', 'service-uuid-3')
ON CONFLICT DO NOTHING;
```

### View Staff Assignments
```sql
SELECT
  u.full_name,
  u.email,
  u.role,
  u.industry_id,
  b.name as branch_name,
  array_agg(s.name) as assigned_services
FROM users u
LEFT JOIN businesses b ON u.branch_id = b.id
LEFT JOIN staff_services ss ON u.id = ss.staff_id
LEFT JOIN services s ON ss.service_id = s.id
WHERE u.role = 'staff'
GROUP BY u.id, u.full_name, u.email, u.role, u.industry_id, b.name
ORDER BY u.full_name;
```

---

## 🎉 You're Ready for Launch!

With this setup:
- ✅ Admins can manage their industry
- ✅ Superadmins can manage everything
- ✅ Staff see only their assigned services
- ✅ Real-time updates work automatically
- ✅ Proper security with RLS
- ✅ Production-ready database schema

---

## 🆘 Need Help?

**Common Issues:**

1. **Can't see admin option in dropdown**
   → Run `FIX_USER_ROLE_ENUM.sql`

2. **Staff see all tickets, not just their services**
   → Check staff_services table, assign services

3. **Real-time not working**
   → Verify RLS policies, check browser console

4. **Admin can't access dashboard**
   → Verify role = 'admin' in users table
   → Verify industry_id is set

**Check Everything is Set Up:**
```sql
-- Verify schema
SELECT tablename FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('businesses', 'staff_services', 'users', 'services');

-- Should return 4 rows

-- Verify branches exist
SELECT COUNT(*) FROM businesses;
-- Should return 24

-- Verify enum values
SELECT enumlabel FROM pg_enum
WHERE enumtypid = 'user_role'::regtype;
-- Should show: customer, staff, admin, superadmin
```

---

**System is ready for production! 🚀**
