# 🔧 Staff Login Troubleshooting Guide

## ✅ Fix Applied

**Issue:** Staff login page doesn't let you login with real email

**Root Cause:** Timing issue - the code was checking user role before it was loaded from the database

**Fix:** 
1. Wait for AuthContext to populate localStorage
2. If not ready, fetch user data directly from Supabase
3. Verify role and populate all necessary localStorage data
4. Then redirect to appropriate dashboard

**Files Modified:**
- `/src/app/pages/StaffPortal.tsx`

---

## 🧪 Test Your Login

### Test 1: Demo Account (Should work instantly)

**Email:** `staff.banking@sqms.com`  
**Password:** `banking123`

**Expected:** ✅ Logs in immediately → Redirects to `/staff`

---

### Test 2: Real Staff Account

**Prerequisites:**
1. Create account through sign-up page
2. Update role in Supabase:
   ```sql
   UPDATE users 
   SET role = 'staff',
       industry_id = 'banking',
       counter_id = 'c1111111-1111-1111-1111-111111111111'
   WHERE email = 'your-email@company.com';
   ```

**Login:**
- Email: `your-email@company.com`
- Password: (what you set during signup)

**Expected:** 
- ✅ Shows "Logging in..." for ~1 second
- ✅ Redirects to `/staff` dashboard
- ✅ Shows your staff info

---

## 🚨 Common Errors & Solutions

### Error: "Invalid email or password"

**Cause:** Email or password is wrong

**Solution:**
1. **Check email is correct** (check in Supabase → Authentication → Users)
2. **Try password reset** if you forgot it
3. **Check caps lock** is off
4. **Verify email is exact match** (no extra spaces)

---

### Error: "Access denied. This account does not have staff or admin privileges"

**Cause:** Your account exists but role is set to `customer`

**Solution:**
```sql
-- In Supabase SQL Editor:
UPDATE users 
SET role = 'staff'  -- or 'admin' or 'superadmin'
WHERE email = 'your-email@company.com';
```

**Verify it worked:**
```sql
SELECT email, role, industry_id FROM users 
WHERE email = 'your-email@company.com';
```

---

### Error: "Failed to load user profile"

**Cause:** Database query failed

**Solution:**
1. **Check Supabase is running**
   - Go to Supabase Dashboard
   - Verify project is active (not paused)

2. **Check user exists in users table**
   ```sql
   SELECT * FROM users WHERE email = 'your-email@company.com';
   ```
   - If no results, the auth account exists but profile doesn't
   - Create the profile:
   ```sql
   -- First, get the auth user ID
   SELECT id FROM auth.users WHERE email = 'your-email@company.com';
   
   -- Then create the profile
   INSERT INTO users (id, email, full_name, role, industry_id)
   VALUES (
     'user-id-from-above',
     'your-email@company.com',
     'Your Name',
     'staff',
     'banking'
   );
   ```

3. **Check RLS policies allow reading**
   - Already configured in COMPLETE_SUPABASE_SETUP.sql
   - But verify: Database → Policies → users table

---

### Login Hangs (Spinning forever)

**Cause:** Network issue or Supabase timeout

**Solution:**
1. **Check browser console** (F12 → Console tab)
   - Look for errors in red
   
2. **Check network tab** (F12 → Network tab)
   - Look for failed requests to Supabase
   
3. **Refresh the page** and try again

4. **Check your internet connection**

5. **Try in incognito window**
   - May be browser extension blocking

---

## 🔍 Debug Checklist

If login still doesn't work, check these:

### 1. Verify Account Exists

**In Supabase Dashboard:**

**Authentication → Users:**
- [ ] Your email appears in the list
- [ ] Status is "Confirmed" (green check)

**Table Editor → users:**
- [ ] Your email appears
- [ ] Role is set to `staff`, `admin`, or `superadmin`
- [ ] industry_id is set (e.g., `banking`)

---

### 2. Verify Credentials

```sql
-- Check your user record
SELECT 
  email, 
  role, 
  industry_id, 
  counter_id,
  created_at
FROM users 
WHERE email = 'your-email@company.com';
```

**Should return:**
```
email                     | role  | industry_id | counter_id
--------------------------|-------|-------------|------------
your-email@company.com    | staff | banking     | c1111111...
```

---

### 3. Browser Console Check

**Open Console (F12):**

**When you click "Login", you should see:**
```
✅ Supabase auth success
✅ User role loaded: staff
✅ Navigating to /staff
```

**If you see errors:**
```
❌ Error: Failed to fetch
→ Check internet connection

❌ Error: Invalid login credentials
→ Wrong email or password

❌ Error: Row Level Security
→ RLS policy blocking access
```

---

## 📊 Quick Test Script

Run this in browser console on the login page to test:

```javascript
// Test staff login
const testLogin = async () => {
  const email = 'your-email@company.com';
  const password = 'your-password';
  
  console.log('Testing login for:', email);
  
  // Try Supabase login
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password
  });
  
  if (error) {
    console.error('❌ Login failed:', error.message);
    return;
  }
  
  console.log('✅ Auth successful, user ID:', data.user.id);
  
  // Check user profile
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  
  if (userError) {
    console.error('❌ Profile fetch failed:', userError.message);
    return;
  }
  
  console.log('✅ Profile loaded:', userData);
  console.log('   Role:', userData.role);
  console.log('   Industry:', userData.industry_id);
  console.log('   Counter:', userData.counter_id);
  
  if (!['staff', 'admin', 'superadmin'].includes(userData.role)) {
    console.error('❌ Role not authorized:', userData.role);
    console.log('   Run this SQL to fix:');
    console.log(`   UPDATE users SET role = 'staff' WHERE email = '${email}';`);
  } else {
    console.log('✅ All checks passed! Login should work.');
  }
};

testLogin();
```

---

## 💡 Manual Override (Emergency)

If nothing works, you can manually set localStorage and navigate:

```javascript
// In browser console on staff-portal page:
localStorage.setItem('sqms_logged_in', 'true');
localStorage.setItem('sqms_user_email', 'your-email@company.com');
localStorage.setItem('sqms_user_role', 'staff');
localStorage.setItem('sqms_user_name', 'Your Name');
localStorage.setItem('sqms_staff_industry', 'banking');
localStorage.setItem('sqms_staff_counter', '1');

// Then navigate
window.location.href = '/staff';
```

**Warning:** This bypasses authentication! Only use for testing.

---

## ✅ Success Indicators

When login works correctly, you should see:

1. **Click "Login" button**
   - ✅ Button shows "Logging in..."
   - ✅ Spinner appears

2. **After ~1 second:**
   - ✅ Page redirects to `/staff` or `/admin`
   - ✅ Staff dashboard loads
   - ✅ Your name appears in header
   - ✅ Counter info shows

3. **In localStorage (F12 → Application → Local Storage):**
   ```
   sqms_logged_in: "true"
   sqms_user_email: "your-email@company.com"
   sqms_user_role: "staff"
   sqms_user_name: "Your Name"
   sqms_staff_industry: "banking"
   sqms_staff_counter: "1"
   ```

---

## 🆘 Still Not Working?

**Last Resort Steps:**

1. **Clear all browser data:**
   - F12 → Application → Storage → Clear site data
   - Refresh page

2. **Try different browser:**
   - Chrome, Firefox, Safari, Edge

3. **Check Supabase project status:**
   - Dashboard → Settings
   - Make sure project is not paused

4. **Verify Supabase URL and key:**
   - Check `/src/lib/supabase.ts`
   - URL should match your Supabase project

5. **Check SQL migrations were run:**
   ```sql
   SELECT tablename FROM pg_publication_tables 
   WHERE pubname = 'supabase_realtime';
   ```
   Should show 6 tables

---

**Your staff login should now work! If you still have issues, check the browser console for specific error messages.** 🎉
