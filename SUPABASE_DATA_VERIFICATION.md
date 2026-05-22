# Supabase Data Verification Guide

## ✅ FIXED: All Queue Tickets & Appointments Now Save to Supabase

### Changes Made

**Files Modified:**

1. **`src/app/pages/Services.tsx`**
   - ✅ Removed demo ticket fallback logic
   - ✅ All tickets now save ONLY to Supabase
   - ✅ Shows clear error messages if save fails
   - ✅ No more localStorage fallbacks

2. **`src/app/pages/Appointments.tsx`**
   - ✅ Fixed missing `branch_id` parameter
   - ✅ Now correctly passes branch when creating appointments
   - ✅ All appointments save directly to Supabase

---

## 🔍 How to Verify Data is in Supabase

### Method 1: Supabase Dashboard (Easiest)

1. **Go to Supabase Dashboard:** https://app.supabase.com/
2. **Select your project**
3. **Click "Table Editor"** in left sidebar

#### Check Queue Tickets:
1. Select **`queue_tickets`** table
2. **Verify columns:**
   - ✅ `id` (UUID)
   - ✅ `ticket_number` (e.g., "A001", "A002")
   - ✅ `customer_id` (UUID)
   - ✅ `industry_id` (text)
   - ✅ `service_id` (UUID)
   - ✅ `branch_id` (UUID) ← Should be populated
   - ✅ `status` ("waiting", "called", "serving", "completed")
   - ✅ `position` (number)
   - ✅ `estimated_wait_time` (number)
   - ✅ `created_at` (timestamp)

#### Check Appointments:
1. Select **`appointments`** table
2. **Verify columns:**
   - ✅ `id` (UUID)
   - ✅ `customer_id` (UUID)
   - ✅ `industry_id` (text)
   - ✅ `service_id` (UUID)
   - ✅ `branch_id` (UUID) ← Should be populated
   - ✅ `appointment_date` (date)
   - ✅ `appointment_time` (text)
   - ✅ `status` ("scheduled", "confirmed", "completed")
   - ✅ `notes` (text, optional)
   - ✅ `created_at` (timestamp)

---

### Method 2: SQL Queries

Run these queries in **Supabase SQL Editor**:

#### View All Queue Tickets (Latest First)
```sql
SELECT 
  ticket_number,
  created_at,
  status,
  position,
  customer_id,
  service_id,
  branch_id
FROM queue_tickets
ORDER BY created_at DESC
LIMIT 20;
```

#### View All Appointments (Latest First)
```sql
SELECT 
  id,
  created_at,
  appointment_date,
  appointment_time,
  status,
  customer_id,
  service_id,
  branch_id
FROM appointments
ORDER BY created_at DESC
LIMIT 20;
```

#### Check Queue Tickets with Customer Details
```sql
SELECT 
  qt.ticket_number,
  qt.created_at,
  qt.status,
  qt.position,
  u.full_name as customer_name,
  u.email as customer_email,
  s.name as service_name,
  b.name as branch_name
FROM queue_tickets qt
LEFT JOIN users u ON qt.customer_id = u.id
LEFT JOIN services s ON qt.service_id = s.id
LEFT JOIN businesses b ON qt.branch_id = b.id
ORDER BY qt.created_at DESC
LIMIT 20;
```

#### Check Appointments with Customer Details
```sql
SELECT 
  a.appointment_date,
  a.appointment_time,
  a.created_at,
  a.status,
  u.full_name as customer_name,
  u.email as customer_email,
  s.name as service_name,
  b.name as branch_name
FROM appointments a
LEFT JOIN users u ON a.customer_id = u.id
LEFT JOIN services s ON a.service_id = s.id
LEFT JOIN businesses b ON a.branch_id = b.id
ORDER BY a.created_at DESC
LIMIT 20;
```

---

## 🧪 Testing the Complete Flow

### Test 1: Create Queue Ticket

1. **Login as customer** (or create new account)
2. **Navigate to Services** → Select Industry → Select Service → Select Branch
3. **Click "Join Virtual Queue"**
4. **Expected Result:**
   - ✅ Success message shown
   - ✅ Ticket number displayed (e.g., "A001")
   - ✅ QR code shown
   - ✅ Redirected to confirmation page

5. **Verify in Supabase:**
   ```sql
   SELECT * FROM queue_tickets ORDER BY created_at DESC LIMIT 1;
   ```
   - ✅ New row appears with your ticket
   - ✅ `branch_id` is populated (not NULL)
   - ✅ `ticket_number` matches what you see in UI
   - ✅ `customer_id` matches your user ID

### Test 2: Create Appointment

1. **Login as customer**
2. **Navigate to Appointments** → Click "Book Appointment"
3. **Fill form:**
   - Select Service
   - Select Branch ← Important!
   - Select Date
   - Select Time
   - Add Notes (optional)
4. **Click "Book Appointment"**
5. **Expected Result:**
   - ✅ Success message: "Appointment booked successfully!"
   - ✅ Appointment appears in your list

6. **Verify in Supabase:**
   ```sql
   SELECT * FROM appointments ORDER BY created_at DESC LIMIT 1;
   ```
   - ✅ New row appears with your appointment
   - ✅ `branch_id` is populated (not NULL)
   - ✅ `appointment_date` and `appointment_time` match what you selected
   - ✅ `status` is "scheduled"

### Test 3: Real-Time Updates

1. **Create a queue ticket** (as customer)
2. **Open Staff Dashboard** (in another tab/browser)
3. **Verify:**
   - ✅ New ticket appears on staff dashboard immediately
   - ✅ Real customer name shown (from Supabase)
   - ✅ Real wait time calculated

4. **Staff calls next customer**
5. **Check Supabase:**
   ```sql
   SELECT ticket_number, status, called_at 
   FROM queue_tickets 
   WHERE status = 'called' 
   ORDER BY called_at DESC 
   LIMIT 1;
   ```
   - ✅ Status updated to "called"
   - ✅ `called_at` timestamp populated

---

## ❌ Common Issues & Solutions

### Issue 1: "Failed to join queue" Error

**Cause:** Service ID is invalid or not found

**Solution:**
1. Go to Supabase → Table Editor → `services` table
2. Verify services exist for your industry
3. Check service IDs are valid UUIDs
4. Run data cleanup: `FIX_DATA_ISSUES.sql`

**SQL to verify:**
```sql
SELECT id, name, industry_id FROM services WHERE industry_id = 'banking';
```

### Issue 2: Branch ID is NULL in Database

**Cause:** Branch not selected or invalid branch ID

**Solution:**
1. Verify branches exist: `SELECT * FROM businesses WHERE industry_id = 'banking';`
2. When joining queue, ensure you select a branch
3. Check that branch dropdown shows options

**Fix missing branches:**
```sql
-- View branches by industry
SELECT industry_id, COUNT(*) as branch_count 
FROM businesses 
WHERE status = 'active' 
GROUP BY industry_id;
```

### Issue 3: Tickets/Appointments Not Appearing

**Possible Causes:**
- Database connection issue
- RLS policies blocking access
- User not authenticated

**Troubleshooting Steps:**

1. **Check Authentication:**
   ```sql
   SELECT id, email, role FROM auth.users ORDER BY created_at DESC LIMIT 10;
   ```

2. **Check RLS Policies:**
   - Go to Supabase → Authentication → Policies
   - Verify policies allow INSERT and SELECT for:
     - `queue_tickets`
     - `appointments`

3. **Check Browser Console:**
   - Open DevTools → Console
   - Look for errors (should be 0)
   - Check Network tab for failed requests

4. **Test Database Connection:**
   ```sql
   SELECT NOW();  -- Should return current timestamp
   ```

### Issue 4: Foreign Key Errors

**Error:** `insert or update on table "queue_tickets" violates foreign key constraint`

**Cause:** Referenced ID doesn't exist (service_id, branch_id, etc.)

**Solution:**
```sql
-- Verify all required data exists
SELECT 'Users' as table_name, COUNT(*) FROM auth.users
UNION ALL
SELECT 'Services', COUNT(*) FROM services WHERE is_active = true
UNION ALL
SELECT 'Branches', COUNT(*) FROM businesses WHERE status = 'active'
UNION ALL
SELECT 'Industries', COUNT(*) FROM industries;
```

---

## 🔒 RLS Policy Verification

### Check Current Policies

```sql
-- View all policies for queue_tickets
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'queue_tickets';

-- View all policies for appointments
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'appointments';
```

### Required Policies

For queue_tickets:
- ✅ Allow INSERT for authenticated users
- ✅ Allow SELECT for authenticated users (their own tickets)
- ✅ Allow UPDATE for staff/admin
- ✅ Allow SELECT ALL for staff/admin

For appointments:
- ✅ Allow INSERT for authenticated users
- ✅ Allow SELECT for authenticated users (their own appointments)
- ✅ Allow UPDATE for staff/admin
- ✅ Allow SELECT ALL for staff/admin

---

## 📊 Data Integrity Checks

### Run These Queries Monthly

#### Check for Orphaned Tickets (Missing Customer)
```sql
SELECT COUNT(*) as orphaned_tickets
FROM queue_tickets
WHERE customer_id NOT IN (SELECT id FROM auth.users);
```
**Expected:** 0

#### Check for Tickets with Invalid Services
```sql
SELECT COUNT(*) as invalid_service_tickets
FROM queue_tickets
WHERE service_id NOT IN (SELECT id FROM services);
```
**Expected:** 0

#### Check for Duplicate Ticket Numbers
```sql
SELECT ticket_number, COUNT(*) as count
FROM queue_tickets
GROUP BY ticket_number
HAVING COUNT(*) > 1;
```
**Expected:** 0 rows

#### Check Branch Assignment Coverage
```sql
SELECT 
  COUNT(*) as total_tickets,
  SUM(CASE WHEN branch_id IS NULL THEN 1 ELSE 0 END) as missing_branch,
  SUM(CASE WHEN branch_id IS NOT NULL THEN 1 ELSE 0 END) as with_branch
FROM queue_tickets;
```
**Expected:** `missing_branch` should be 0

---

## 🎯 Success Checklist

After creating a ticket or appointment, verify:

- [ ] Record exists in Supabase table
- [ ] All required fields populated (no NULLs where not expected)
- [ ] Foreign keys valid (customer_id, service_id, branch_id)
- [ ] Timestamps set correctly (created_at)
- [ ] Status field correct ("waiting" for tickets, "scheduled" for appointments)
- [ ] Data appears on staff dashboard in real-time
- [ ] Customer can view their ticket/appointment
- [ ] No errors in browser console

---

## 🚀 Production Deployment Checklist

Before going live:

- [ ] Run `ADD_BRANCH_TO_TICKETS.sql` migration
- [ ] Run `FIX_DATA_ISSUES.sql` to clean duplicates
- [ ] Verify RLS policies are enabled
- [ ] Test ticket creation → Check Supabase
- [ ] Test appointment creation → Check Supabase
- [ ] Test staff calling customer → Status updates in DB
- [ ] Test real-time updates working
- [ ] Verify branch_id populates correctly
- [ ] Check no demo tickets in production database
- [ ] Monitor for errors in first 24 hours

---

## 📝 Monitoring Queries

### Daily Metrics

```sql
-- Today's tickets
SELECT COUNT(*) as tickets_today
FROM queue_tickets
WHERE created_at >= CURRENT_DATE;

-- Today's appointments
SELECT COUNT(*) as appointments_today
FROM appointments
WHERE created_at >= CURRENT_DATE;

-- Tickets by status
SELECT status, COUNT(*) as count
FROM queue_tickets
WHERE created_at >= CURRENT_DATE
GROUP BY status
ORDER BY count DESC;

-- Appointments by status
SELECT status, COUNT(*) as count
FROM appointments
WHERE appointment_date >= CURRENT_DATE
GROUP BY status
ORDER BY count DESC;
```

---

## ✅ Summary

**What Changed:**
1. ✅ Removed all demo ticket fallbacks
2. ✅ All queue tickets save directly to Supabase
3. ✅ All appointments save directly to Supabase with branch_id
4. ✅ Clear error messages if save fails
5. ✅ Real-time updates work with Supabase data

**How to Verify:**
1. Create ticket → Check Supabase Table Editor
2. Create appointment → Check Supabase Table Editor
3. Run SQL queries to view data
4. Monitor staff dashboard for real-time updates

**Your data is now 100% in Supabase!** 🎉
