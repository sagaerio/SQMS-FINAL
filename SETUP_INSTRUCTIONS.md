# 🚀 Complete Supabase Setup Instructions

Follow these steps to fully populate your Supabase database and make your SQMS app production-ready.

---

## Step 1: Go to Your Supabase Dashboard

1. Open https://supabase.com/dashboard
2. Sign in to your account
3. Select your project: **nyhjatpnafdlgmsjbpmv**

---

## Step 2: Run the Complete Setup SQL

1. In your Supabase Dashboard, click **SQL Editor** in the left sidebar
2. Click **New Query**
3. Open the file `COMPLETE_SUPABASE_SETUP.sql` from your project
4. **Copy the ENTIRE file contents**
5. **Paste it into the Supabase SQL Editor**
6. Click **Run** (or press Ctrl+Enter / Cmd+Enter)

This will create:
- ✅ All 6 industry tables with data
- ✅ All 30 services (5 per industry)
- ✅ 6 demo businesses (one per industry)
- ✅ 20 counters across all businesses
- ✅ Row Level Security policies
- ✅ Real-time subscriptions
- ✅ All necessary functions and triggers

**Expected Result:** You should see "Success. No rows returned" at the bottom - this is normal and means everything was created successfully!

---

## Step 3: Verify Your Data

Run these queries in the SQL Editor to verify:

```sql
-- Check industries (should return 6)
SELECT COUNT(*) as industry_count FROM industries;

-- Check services (should return 30 total)
SELECT industry_id, COUNT(*) as service_count 
FROM services 
GROUP BY industry_id;

-- Check businesses (should return 6)
SELECT name, industry_id FROM businesses;

-- Check counters (should return 20 total)
SELECT c.name, b.name as business_name, c.industry_id
FROM counters c
JOIN businesses b ON c.business_id = b.id
ORDER BY c.industry_id;
```

---

## Step 4: Create Your First User Account

### Option A: Through Your App (Recommended)

1. Run your app: `pnpm dev`
2. Go to the Sign Up page
3. Create an account with your email and password
4. The account will be created as a **customer** by default

### Option B: Through Supabase Dashboard

1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Enter email and password
4. Click **Save**

---

## Step 5: Make Yourself a Super Admin

1. In Supabase Dashboard, go to **Table Editor**
2. Click on the **users** table
3. Find your newly created user
4. Click **Edit** (pencil icon)
5. Change the **role** field to `superadmin`
6. Fill in your **full_name** if empty
7. Click **Save**

---

## Step 6: Test Your Setup

### Test Customer Flow:
1. Sign in to your app as a customer
2. Select an industry (e.g., Banking)
3. Choose a service (e.g., Account Opening)
4. Join the queue
5. You should see your ticket number and queue position!

### Test Staff/Admin Flow:
1. Create another user account
2. In Supabase, change their role to `staff`
3. Set their `industry_id` to an industry (e.g., `banking`)
4. Sign in as that staff member
5. You should see the staff dashboard with queue management!

---

## Step 7: Enable Email Authentication (If Not Already Enabled)

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. (Optional) Disable email confirmation for development:
   - Go to **Authentication** → **Providers** → **Email**
   - Turn off "Confirm email"

---

## What You Have Now

Your Supabase database is fully populated with:

### Industries (6 total)
- Banking & Finance
- Healthcare
- Retail
- Government Services
- Education
- Corporate Office

### Services (30 total - 5 per industry)
Each industry has 5 specific services ready to use

### Demo Businesses (6 total - 1 per industry)
- First National Bank (Banking)
- City Medical Center (Healthcare)
- TechMart Electronics (Retail)
- City Hall Services (Government)
- State University (Education)
- Global Tech Corp (Corporate)

### Counters (20 total - 3-4 per business)
Each business has multiple counters ready to serve customers

---

## Troubleshooting

### "No rows returned" after running SQL
✅ This is **normal** and means the setup completed successfully!

### Can't see industries or services in the app
- Make sure you ran the complete SQL file
- Verify your Supabase URL and key in `src/lib/supabase.ts`
- Check browser console for errors

### Authentication errors
- Verify email provider is enabled in Supabase
- Make sure your user exists in both `auth.users` and `users` table
- Check that the user has a valid `role` field

### RLS Policy Errors
- Make sure you're signed in
- Verify your user's role in the `users` table
- Check that RLS policies were created (run the SQL again if needed)

---

## Next Steps to Go Live

1. ✅ Database is set up
2. ✅ Demo data is populated
3. ⬜ Test all features thoroughly
4. ⬜ Deploy to Vercel/Netlify/your hosting platform
5. ⬜ Update Supabase settings for production:
   - Enable email confirmation
   - Configure email templates
   - Set up proper backup strategies
   - Review security settings

---

## Need Help?

- Check Supabase Logs: Dashboard → Logs
- Review RLS Policies: SQL Editor
- Check browser console for errors
- Verify network requests in DevTools

---

**Your SQMS is ready to go live! 🎉**
