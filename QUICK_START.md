# Quick Start Guide - SQMS Supabase Integration

## Your Project is Connected! 🎉

Your SQMS application is already configured to connect to your Supabase project:
- **Project URL:** `https://nyhjatpnafdlgmsjbpmv.supabase.co`
- **Configuration:** `/src/lib/supabase.ts`

## Step-by-Step Setup

### 1. Verify Your Database Schema

Your database should already have these tables (check in Supabase Table Editor):
- ✅ `users`
- ✅ `industries`
- ✅ `services`
- ✅ `businesses`
- ✅ `counters`
- ✅ `queue_tickets`
- ✅ `appointments`

If you're missing tables, you need to run your schema migrations first.

### 2. Seed Your Database

Open Supabase SQL Editor and run the seed file:

```bash
# Copy contents of database_seed.sql
# Paste into Supabase SQL Editor
# Click "Run"
```

This will populate:
- 6 Industries (Banking, Healthcare, Retail, Government, Education, Corporate)
- ~40 Services across all industries
- 3 Sample businesses/branches

### 3. Create Test Users

#### Option A: Via Supabase Auth UI
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User"
3. Create users with different emails

#### Option B: Via Sign Up in App
1. Run your app
2. Go to `/signup`
3. Create new accounts

**Important:** After creating users via Supabase Auth, add them to the `users` table:

```sql
-- Replace with actual auth user ID from auth.users table
INSERT INTO users (id, email, full_name, role, industry_id) VALUES
('auth-user-id-here', 'customer@example.com', 'John Customer', 'customer', NULL);

-- For staff, add industry_id
INSERT INTO users (id, email, full_name, role, industry_id) VALUES
('auth-user-id-here', 'staff@example.com', 'Jane Staff', 'staff', 
  (SELECT id FROM industries WHERE name = 'Banking'));
```

### 4. Test the Integration

#### Test Customer Flow:
1. Sign in as a customer
2. Select an industry (e.g., Banking)
3. Select a service (e.g., Account Opening)
4. Join virtual queue → Creates entry in `queue_tickets`
5. Book appointment → Creates entry in `appointments`

#### Test Staff Flow:
1. Sign in as staff
2. View assigned counter
3. Call next customer
4. Complete service

### 5. Enable Real-Time (Optional but Recommended)

In Supabase Dashboard:
1. Go to Database → Replication
2. Enable replication for these tables:
   - `queue_tickets` ✓
   - `appointments` ✓
   - `counters` ✓

This enables live queue updates without page refresh!

## What's Working Now

### ✅ Fully Integrated
- **Authentication** - Sign up, sign in, password reset
- **Industries** - Loaded from database
- **Services** - Loaded from database by industry
- **Appointments** - Full CRUD operations
- **Queue Tickets** - Create and view tickets

### ⚠️ Partially Integrated (uses Supabase but has fallbacks)
- **Dashboard** - Uses services from DB, shows mock branches
- **Services Page** - Creates real tickets, uses mock branch data
- **IndustryContext** - Falls back to hardcoded industries if DB empty

### ❌ Still Using Mock Data (next to update)
- **VirtualQueue** - Uses `businessTypes.ts` for branches
- **QueueStatus** - Uses localStorage
- **StaffDashboard** - Uses mock queue data
- **AdminDashboard** - Uses mock analytics

## Common Tasks

### Add a New Industry

```sql
INSERT INTO industries (name, icon, color, description) VALUES
('Hospitality', '🏨', 'from-pink-600 to-rose-600', 'Hotel and hospitality services');
```

### Add Services to Industry

```sql
-- Get industry ID first
SELECT id, name FROM industries WHERE name = 'Hospitality';

-- Add services
INSERT INTO services (industry_id, name, description, estimated_time, is_active) VALUES
('industry-id-here', 'Check-In', 'Hotel check-in service', 10, true),
('industry-id-here', 'Concierge', 'Concierge assistance', 15, true);
```

### Create a New Business/Branch

```sql
INSERT INTO businesses (name, industry_id, address, phone, email, status) VALUES
('Times Square Hotel',
 (SELECT id FROM industries WHERE name = 'Hospitality'),
 '1 Times Square, New York, NY 10036',
 '+1 (555) 777-8888',
 'info@timessquarehotel.example.com',
 'approved');
```

### Add Counters to Business

```sql
-- Get service IDs for this industry
SELECT id, name FROM services WHERE industry_id = (SELECT id FROM industries WHERE name = 'Banking');

-- Create counters
INSERT INTO counters (business_id, name, industry_id, service_ids, status) VALUES
((SELECT id FROM businesses WHERE name = 'Downtown Financial Center'),
 'Counter 1',
 (SELECT id FROM industries WHERE name = 'Banking'),
 ARRAY['service-id-1', 'service-id-2', 'service-id-3']::uuid[],
 'active');
```

## Checking Your Data

Run these queries in Supabase SQL Editor:

```sql
-- Check industries and service counts
SELECT
  i.name as industry,
  COUNT(s.id) as total_services,
  COUNT(CASE WHEN s.is_active THEN 1 END) as active_services
FROM industries i
LEFT JOIN services s ON s.industry_id = i.id
GROUP BY i.name
ORDER BY i.name;

-- Check businesses by industry
SELECT
  i.name as industry,
  b.name as business,
  b.status,
  COUNT(c.id) as counter_count
FROM industries i
LEFT JOIN businesses b ON b.industry_id = i.id
LEFT JOIN counters c ON c.business_id = b.id
GROUP BY i.name, b.name, b.status
ORDER BY i.name, b.name;

-- Check queue tickets
SELECT
  t.ticket_number,
  u.full_name as customer,
  s.name as service,
  i.name as industry,
  t.status,
  t.position,
  t.estimated_wait_time
FROM queue_tickets t
JOIN users u ON t.customer_id = u.id
JOIN services s ON t.service_id = s.id
JOIN industries i ON t.industry_id = i.id
ORDER BY t.created_at DESC
LIMIT 10;

-- Check appointments
SELECT
  u.full_name as customer,
  s.name as service,
  a.appointment_date,
  a.appointment_time,
  a.status
FROM appointments a
JOIN users u ON a.customer_id = u.id
JOIN services s ON a.service_id = s.id
ORDER BY a.appointment_date, a.appointment_time
LIMIT 10;
```

## Troubleshooting

### Issue: "No industries showing in app"
**Fix:**
1. Check industries exist: `SELECT * FROM industries;`
2. If empty, run `database_seed.sql`
3. Clear browser cache and reload

### Issue: "No services for selected industry"
**Fix:**
1. Check services: `SELECT * FROM services WHERE industry_id = 'id-here';`
2. Verify `is_active = true`
3. Run seed file if empty

### Issue: "Can't create appointments/tickets"
**Fix:**
1. Verify user is signed in
2. Check user exists in `users` table (not just `auth.users`)
3. Verify industry and service IDs are valid
4. Check browser console for errors

### Issue: "Permission denied" errors
**Fix:**
1. Check Row Level Security (RLS) policies
2. Verify user has correct role
3. Ensure user's `industry_id` matches if required

## Next Steps

1. **Add Real Branches/Businesses**
   - Use the SQL commands above to add your actual locations

2. **Set Up Counters**
   - Assign counters to your businesses
   - Assign staff to counters

3. **Configure RLS Policies**
   - Review security policies in Supabase
   - Ensure proper access control

4. **Enable Real-Time**
   - Set up real-time subscriptions
   - Test live queue updates

5. **Complete Remaining Integrations**
   - Update VirtualQueue page
   - Update QueueStatus page  
   - Update StaffDashboard page
   - Update AdminDashboard page

## Documentation

- **Full Integration Guide:** See `SUPABASE_INTEGRATION.md`
- **API Reference:** See `/src/services/queueService.ts`
- **Database Schema:** See Supabase Table Editor
- **Supabase Docs:** https://supabase.com/docs

---

**Need Help?**
- Check the browser console for errors
- Review Supabase logs in the dashboard
- Verify data exists in your tables
- Ensure RLS policies allow access
