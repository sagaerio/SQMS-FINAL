# 📊 Database Verification & Testing Guide

After running `COMPLETE_SUPABASE_SETUP.sql`, use this guide to verify everything is working correctly.

---

## ✅ Step 1: Verify Tables Were Created

Go to **Supabase Dashboard** → **Table Editor**

You should see these tables in the left sidebar:

```
✅ industries (6 rows)
✅ services (30 rows)
✅ businesses (6 rows)
✅ counters (20 rows)
✅ users (initially empty until you sign up)
✅ queue_tickets (empty until customers join queues)
✅ appointments (empty until customers book)
```

---

## 🔍 Step 2: Check Your Data

### Check Industries (Should show 6)

Go to **SQL Editor** and run:

```sql
SELECT * FROM industries ORDER BY id;
```

**Expected Result:**
```
id         | name                    | icon          | color
-----------|-------------------------|---------------|---------------------------
banking    | Banking & Finance       | Landmark      | from-blue-600 to-blue-700
healthcare | Healthcare              | Heart         | from-red-600 to-pink-600
retail     | Retail                  | ShoppingBag   | from-purple-600 to-purple-700
government | Government Services     | Building2     | from-teal-600 to-teal-700
education  | Education               | GraduationCap | from-orange-600 to-orange-700
corporate  | Corporate Office        | Briefcase     | from-slate-600 to-slate-700
```

---

### Check Services (Should show 30 - 5 per industry)

```sql
SELECT industry_id, name, estimated_time 
FROM services 
ORDER BY industry_id, name;
```

**Expected Result for Banking:**
```
industry_id | name                      | estimated_time
------------|---------------------------|---------------
banking     | Account Opening           | 20
banking     | Card Services             | 15
banking     | General Inquiry           | 10
banking     | Investment Consultation   | 30
banking     | Loan Inquiry              | 25
```

**To see count per industry:**
```sql
SELECT industry_id, COUNT(*) as service_count 
FROM services 
GROUP BY industry_id 
ORDER BY industry_id;
```

**Expected:**
```
industry_id | service_count
------------|-------------
banking     | 5
corporate   | 5
education   | 5
government  | 5
healthcare  | 5
retail      | 5
```

---

### Check Businesses (Should show 6)

```sql
SELECT name, industry_id, address, status 
FROM businesses 
ORDER BY industry_id;
```

**Expected Result:**
```
name                  | industry_id | address                              | status
----------------------|-------------|--------------------------------------|--------
First National Bank   | banking     | 123 Finance Street, Downtown         | approved
Global Tech Corp      | corporate   | 987 Corporate Blvd, Business Park    | approved
State University      | education   | 654 Campus Drive, University Dist    | approved
City Hall Services    | government  | 321 Government Way, Civic Center     | approved
City Medical Center   | healthcare  | 456 Health Avenue, Medical District  | approved
TechMart Electronics  | retail      | 789 Shopping Plaza, Mall District    | approved
```

---

### Check Counters (Should show 20)

```sql
SELECT c.name, b.name as business, c.industry_id, c.status,
       ARRAY_LENGTH(c.service_ids, 1) as services_assigned
FROM counters c
JOIN businesses b ON c.business_id = b.id
ORDER BY c.industry_id, c.name;
```

**Expected Result (Sample):**
```
name             | business              | industry_id | status | services_assigned
-----------------|-----------------------|-------------|--------|------------------
Counter 1        | First National Bank   | banking     | active | 5
Counter 2        | First National Bank   | banking     | active | 5
Counter 3        | First National Bank   | banking     | active | 5
HR Desk          | Global Tech Corp      | corporate   | active | 5
IT Support       | Global Tech Corp      | corporate   | active | 5
Facilities       | Global Tech Corp      | corporate   | active | 5
...
```

**Count by industry:**
```sql
SELECT industry_id, COUNT(*) as counter_count 
FROM counters 
GROUP BY industry_id 
ORDER BY industry_id;
```

---

## 👥 Step 3: Create Demo Accounts

### Create Your Superadmin Account

1. **Sign up through your app** with your real email
2. After creating the account, run this in SQL Editor:

```sql
-- Replace with your actual email
UPDATE users 
SET role = 'superadmin', 
    full_name = 'Your Name'
WHERE email = 'your-email@example.com';
```

3. **Verify it worked:**
```sql
SELECT full_name, email, role FROM users WHERE role = 'superadmin';
```

---

### Create Staff Demo Accounts

Create these accounts **through your app's sign-up page**:

| Email                      | Password  | Full Name           |
|----------------------------|-----------|---------------------|
| staff.banking@demo.com     | Demo123!  | Sarah Johnson       |
| staff.healthcare@demo.com  | Demo123!  | Dr. Michael Chen    |
| staff.retail@demo.com      | Demo123!  | Emily Rodriguez     |
| staff.government@demo.com  | Demo123!  | Robert Williams     |
| staff.education@demo.com   | Demo123!  | Jennifer Martinez   |
| staff.corporate@demo.com   | Demo123!  | David Thompson      |

After creating each account, **update their role in SQL Editor:**

```sql
-- Banking Staff
UPDATE users 
SET role = 'staff', 
    industry_id = 'banking', 
    counter_id = 'c1111111-1111-1111-1111-111111111111',
    full_name = 'Sarah Johnson'
WHERE email = 'staff.banking@demo.com';

-- Healthcare Staff
UPDATE users 
SET role = 'staff', 
    industry_id = 'healthcare', 
    counter_id = 'c2222222-2222-2222-2222-222222222221',
    full_name = 'Dr. Michael Chen'
WHERE email = 'staff.healthcare@demo.com';

-- Retail Staff
UPDATE users 
SET role = 'staff', 
    industry_id = 'retail', 
    counter_id = 'c3333333-3333-3333-3333-333333333331',
    full_name = 'Emily Rodriguez'
WHERE email = 'staff.retail@demo.com';

-- Government Staff
UPDATE users 
SET role = 'staff', 
    industry_id = 'government', 
    counter_id = 'c4444444-4444-4444-4444-444444444441',
    full_name = 'Robert Williams'
WHERE email = 'staff.government@demo.com';

-- Education Staff
UPDATE users 
SET role = 'staff', 
    industry_id = 'education', 
    counter_id = 'c5555555-5555-5555-5555-555555555551',
    full_name = 'Jennifer Martinez'
WHERE email = 'staff.education@demo.com';

-- Corporate Staff
UPDATE users 
SET role = 'staff', 
    industry_id = 'corporate', 
    counter_id = 'c6666666-6666-6666-6666-666666666661',
    full_name = 'David Thompson'
WHERE email = 'staff.corporate@demo.com';
```

**Verify staff accounts:**
```sql
SELECT full_name, email, role, industry_id 
FROM users 
WHERE role = 'staff' 
ORDER BY industry_id;
```

---

### Create Admin Demo Accounts

Create these accounts **through your app**:

| Email                       | Password  | Full Name              |
|-----------------------------|-----------|------------------------|
| admin.banking@demo.com      | Demo123!  | Patricia Anderson      |
| admin.healthcare@demo.com   | Demo123!  | Dr. James Wilson       |
| admin.retail@demo.com       | Demo123!  | Amanda Taylor          |
| admin.government@demo.com   | Demo123!  | Thomas Brown           |
| admin.education@demo.com    | Demo123!  | Linda Davis            |
| admin.corporate@demo.com    | Demo123!  | Richard Miller         |

**Update their roles:**

```sql
-- Banking Admin
UPDATE users 
SET role = 'admin', 
    industry_id = 'banking', 
    business_id = 'b1111111-1111-1111-1111-111111111111',
    full_name = 'Patricia Anderson'
WHERE email = 'admin.banking@demo.com';

-- Healthcare Admin
UPDATE users 
SET role = 'admin', 
    industry_id = 'healthcare', 
    business_id = 'b2222222-2222-2222-2222-222222222222',
    full_name = 'Dr. James Wilson'
WHERE email = 'admin.healthcare@demo.com';

-- Retail Admin
UPDATE users 
SET role = 'admin', 
    industry_id = 'retail', 
    business_id = 'b3333333-3333-3333-3333-333333333333',
    full_name = 'Amanda Taylor'
WHERE email = 'admin.retail@demo.com';

-- Government Admin
UPDATE users 
SET role = 'admin', 
    industry_id = 'government', 
    business_id = 'b4444444-4444-4444-4444-444444444444',
    full_name = 'Thomas Brown'
WHERE email = 'admin.government@demo.com';

-- Education Admin
UPDATE users 
SET role = 'admin', 
    industry_id = 'education', 
    business_id = 'b5555555-5555-5555-5555-555555555555',
    full_name = 'Linda Davis'
WHERE email = 'admin.education@demo.com';

-- Corporate Admin
UPDATE users 
SET role = 'admin', 
    industry_id = 'corporate', 
    business_id = 'b6666666-6666-6666-6666-666666666666',
    full_name = 'Richard Miller'
WHERE email = 'admin.corporate@demo.com';
```

---

### Create Customer Demo Accounts

Create 3-5 customer accounts for testing:

| Email                  | Password  | Full Name        |
|------------------------|-----------|------------------|
| customer1@demo.com     | Demo123!  | Alex Johnson     |
| customer2@demo.com     | Demo123!  | Maria Garcia     |
| customer3@demo.com     | Demo123!  | Kevin Lee        |

These will automatically be `customer` role - no need to update!

---

## 🧪 Step 4: Test The Full System

### Test 1: Customer Joins Queue

1. Sign in as `customer1@demo.com`
2. Select **Banking** industry
3. Choose **Account Opening** service
4. Click **Join Queue**
5. You should get a ticket like `BNK-0001`

**Verify in database:**
```sql
SELECT ticket_number, status, position, estimated_wait_time
FROM queue_tickets
ORDER BY created_at DESC
LIMIT 5;
```

---

### Test 2: Staff Manages Queue

1. Sign out
2. Sign in as `staff.banking@demo.com`
3. You should see the customer in the waiting queue
4. Click **Call Next** to call them
5. Click **Serve** to mark as serving

**Verify status changed:**
```sql
SELECT ticket_number, status, called_at, served_at
FROM queue_tickets
WHERE status IN ('called', 'serving')
ORDER BY created_at DESC;
```

---

### Test 3: Customer Books Appointment

1. Sign in as `customer2@demo.com`
2. Go to **Appointments** page
3. Select **Healthcare** industry
4. Select **General Consultation** service
5. Pick a future date and time
6. Click **Book Appointment**

**Verify in database:**
```sql
SELECT c.full_name as customer, i.name as industry, s.name as service,
       appointment_date, appointment_time, status
FROM appointments a
JOIN users c ON a.customer_id = c.id
JOIN industries i ON a.industry_id = i.id
JOIN services s ON a.service_id = s.id
ORDER BY appointment_date, appointment_time;
```

---

### Test 4: Admin Views Dashboard

1. Sign in as `admin.banking@demo.com`
2. You should see analytics for the banking industry
3. Check employee management
4. View queue statistics

---

### Test 5: Superadmin Full Access

1. Sign in with your superadmin account
2. You should be able to access ALL industries
3. Approve/reject businesses
4. Manage all users across all industries

---

## 📊 Useful SQL Queries

### See all users by role
```sql
SELECT role, COUNT(*) as user_count 
FROM users 
GROUP BY role 
ORDER BY role;
```

### See today's queue activity
```sql
SELECT industry_id, status, COUNT(*) as ticket_count
FROM queue_tickets
WHERE DATE(created_at) = CURRENT_DATE
GROUP BY industry_id, status
ORDER BY industry_id, status;
```

### See upcoming appointments
```sql
SELECT a.appointment_date, a.appointment_time, 
       u.full_name as customer, s.name as service, i.name as industry
FROM appointments a
JOIN users u ON a.customer_id = u.id
JOIN services s ON a.service_id = s.id
JOIN industries i ON a.industry_id = i.id
WHERE a.appointment_date >= CURRENT_DATE
AND a.status = 'scheduled'
ORDER BY a.appointment_date, a.appointment_time;
```

### See staff assignments
```sql
SELECT u.full_name as staff_name, u.email,
       c.name as counter_name, b.name as business_name
FROM users u
JOIN counters c ON u.counter_id = c.id::TEXT
JOIN businesses b ON c.business_id = b.id
WHERE u.role = 'staff'
ORDER BY b.industry_id;
```

### Delete all test tickets (if you want to reset)
```sql
DELETE FROM queue_tickets;
DELETE FROM appointments;
```

---

## ✅ Final Checklist

- [ ] All 6 industries showing
- [ ] All 30 services visible
- [ ] All 6 businesses created
- [ ] All 20 counters active
- [ ] Superadmin account created
- [ ] 6 staff accounts created (one per industry)
- [ ] 6 admin accounts created (one per industry)
- [ ] 3+ customer accounts for testing
- [ ] Customer can join queue successfully
- [ ] Staff can see and manage queue
- [ ] Customer can book appointments
- [ ] Admin can view dashboard
- [ ] Real-time updates working

---

**Your SQMS is now fully populated and production-ready! 🎉**
