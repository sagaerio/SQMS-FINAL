# 👥 Staff/Admin Login Guide

## How Staff Login Now Works

Your staff portal now supports **BOTH** real Supabase users AND demo accounts!

---

## ✅ Real Users (Supabase Accounts)

Any user created in your Supabase database can login to the staff portal if they have the correct role.

### How to Create a Real Staff Account

**Step 1: Sign up through your app**
- Go to the Sign Up page
- Create an account with any email (e.g., `john.doe@yourcompany.com`)
- Complete the signup process

**Step 2: Update their role in Supabase**
- Go to Supabase Dashboard → **Table Editor** → **users**
- Find the user you just created
- Click **Edit**
- Update these fields:
  - `role`: Set to `staff`, `admin`, or `superadmin`
  - `industry_id`: Set to their industry (e.g., `banking`, `healthcare`, etc.)
  - `counter_id`: (For staff only) Set to their counter UUID
  - `business_id`: (For admin only) Set to their business UUID
- Click **Save**

**Step 3: They can now login!**
- Go to `/staff-portal`
- Enter their email and password
- They'll be directed to the appropriate dashboard based on their role

---

## 🎯 Demo Accounts (For Testing)

Demo accounts work instantly without any database setup:

### Super Admin
- **Email:** `superadmin@sqms.com`
- **Password:** `super123`
- **Access:** Full system access

### Industry Admins
- **Email Pattern:** `admin.{industry}@sqms.com`
- **Password:** `admin123`
- **Examples:**
  - `admin.banking@sqms.com` / `admin123`
  - `admin.healthcare@sqms.com` / `admin123`
  - `admin.retail@sqms.com` / `admin123`

### Industry Staff
- **Email Pattern:** `staff.{industry}@sqms.com`
- **Password:** `{industry}123`
- **Examples:**
  - `staff.banking@sqms.com` / `banking123`
  - `staff.healthcare@sqms.com` / `healthcare123`
  - `staff.retail@sqms.com` / `retail123`

---

## 🔐 How Login Works

The staff portal login follows this flow:

1. **Check for demo account match** → If found, login immediately
2. **Try Supabase authentication** → Verify email/password
3. **Check user role** → Must be `staff`, `admin`, or `superadmin`
4. **Redirect to dashboard** → Based on their role

---

## 🚨 Common Issues

### "Access denied. This account does not have staff or admin privileges"

**Problem:** The user's role in the database is `customer`

**Solution:** 
```sql
-- Update user role in Supabase SQL Editor
UPDATE users 
SET role = 'staff',  -- or 'admin' or 'superadmin'
    industry_id = 'banking'  -- their industry
WHERE email = 'user@email.com';
```

### "Invalid email or password"

**Problem:** Either:
- Wrong email/password
- User doesn't exist in Supabase

**Solution:**
1. Check if user exists in **Authentication** → **Users**
2. If not, they need to sign up first
3. If yes, verify password is correct

### User logs in but sees customer dashboard

**Problem:** The role is set to `customer` instead of `staff`/`admin`

**Solution:**
```sql
UPDATE users 
SET role = 'staff'  -- Change customer to staff
WHERE email = 'user@email.com';
```

---

## 📝 Quick Setup Example

Let's create a real staff member for the Banking industry:

**1. Create account through app:**
- Sign up with: `sarah.johnson@bank.com` / `SecurePass123`

**2. Update in Supabase SQL Editor:**
```sql
UPDATE users 
SET role = 'staff',
    industry_id = 'banking',
    counter_id = 'c1111111-1111-1111-1111-111111111111',  -- Counter 1 UUID
    full_name = 'Sarah Johnson'
WHERE email = 'sarah.johnson@bank.com';
```

**3. Login:**
- Go to `/staff-portal`
- Email: `sarah.johnson@bank.com`
- Password: `SecurePass123`
- ✅ She's in!

---

## 🎯 Role Permissions

| Role | Can Access | Dashboard |
|------|-----------|-----------|
| **customer** | ❌ Staff Portal | Customer Dashboard |
| **staff** | ✅ Staff Portal | Staff Dashboard (their industry only) |
| **admin** | ✅ Staff Portal | Admin Dashboard (their industry only) |
| **superadmin** | ✅ Staff Portal | Admin Dashboard (all industries) |

---

## 🔧 For Developers

The login logic is in:
- `/src/app/pages/StaffPortal.tsx` - Login page & authentication
- `/src/app/contexts/AuthContext.tsx` - Supabase authentication

Real users authenticate via:
```typescript
const { error } = await signIn(email, password);
// Checks Supabase auth + loads user profile from users table
```

Demo users authenticate via:
```typescript
const demoAccount = allAccounts.find(acc => acc.email === email);
// Bypasses Supabase for instant testing
```

---

**Your staff portal now works with real production users! 🎉**
