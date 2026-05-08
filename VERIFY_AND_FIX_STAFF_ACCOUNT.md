# 🔍 Verify & Fix Your Staff Account

You're getting "Invalid email or password" - let's verify your account exists and fix it.

---

## Step 1: Check If Your Account Exists

Go to **Supabase Dashboard** → **Authentication** → **Users**

### ✅ If you see your email in the list:

Your auth account exists! The issue is the password.

**Solution:** Reset your password

**Option A: Via Supabase Dashboard**
1. Click on your user in the list
2. Click **"Send password recovery email"**
3. Check your email and reset password
4. Try logging in again

**Option B: Create new password via SQL**
```sql
-- In Supabase SQL Editor:
-- Replace with your email and desired password
UPDATE auth.users 
SET encrypted_password = crypt('YOUR_NEW_PASSWORD', gen_salt('bf'))
WHERE email = 'your-email@company.com';
```

Then try logging in with the new password!

---

### ❌ If you DON'T see your email:

Your account doesn't exist yet! Let's create it.

---

## Step 2: Create Your Staff Account

### Option A: Through Sign-Up Page (Recommended)

1. **Go to your app's sign-up page** (`/signup`)
2. **Create account:**
   - First Name: Your first name
   - Last Name: Your last name
   - Date of Birth: (must be 21+)
   - Email: `your-email@company.com`
   - Password: `YourSecurePassword123`
   - Confirm Password: `YourSecurePassword123`
3. **Click "Create Account"**
4. **Wait for success message**

5. **Now update role in Supabase:**

```sql
-- In Supabase SQL Editor:
UPDATE users 
SET role = 'staff',
    industry_id = 'banking',  -- or healthcare, retail, etc.
    counter_id = 'c1111111-1111-1111-1111-111111111111'  -- Counter 1 for banking
WHERE email = 'your-email@company.com';
```

6. **Verify it worked:**
```sql
SELECT email, full_name, role, industry_id 
FROM users 
WHERE email = 'your-email@company.com';
```

**Expected result:**
```
email                  | full_name  | role  | industry_id
-----------------------|------------|-------|------------
your-email@company.com | Your Name  | staff | banking
```

7. **Now try logging in at `/staff-portal`**

---

### Option B: Create Directly in Supabase

If sign-up page isn't working, create the account in Supabase:

**1. Create auth account:**

Go to **Authentication** → **Users** → Click **"Add user"**

Fill in:
- Email: `your-email@company.com`
- Password: `YourSecurePassword123`
- Auto-confirm: ✅ Enable (so you don't need email verification)

Click **"Create user"**

**2. Create user profile:**

```sql
-- Get the user ID that was just created
SELECT id FROM auth.users WHERE email = 'your-email@company.com';

-- Copy that ID, then insert into users table:
INSERT INTO users (id, email, full_name, role, industry_id, counter_id)
VALUES (
  'paste-the-id-here',  -- Replace with actual UUID from above
  'your-email@company.com',
  'Your Full Name',
  'staff',
  'banking',  -- or your industry
  'c1111111-1111-1111-1111-111111111111'  -- Counter 1
);
```

**3. Verify it worked:**
```sql
SELECT 
  au.email as auth_email,
  u.email as profile_email,
  u.full_name,
  u.role,
  u.industry_id
FROM auth.users au
LEFT JOIN users u ON au.id = u.id
WHERE au.email = 'your-email@company.com';
```

**Expected:**
```
auth_email              | profile_email          | full_name  | role  | industry_id
------------------------|------------------------|------------|-------|------------
your-email@company.com  | your-email@company.com | Your Name  | staff | banking
```

**4. Now try logging in!**

---

## Step 3: Test Login

**Go to:** `/staff-portal`

**Login with:**
- Email: `your-email@company.com`
- Password: `YourSecurePassword123` (or whatever you set)

**Expected:**
- ✅ Button shows "Logging in..."
- ✅ Redirects to `/staff` dashboard
- ✅ Shows your name and counter info

---

## 🚨 Still Getting "Invalid email or password"?

### Debug: Test your credentials in console

**1. Open browser console (F12)**

**2. Paste this code:**

```javascript
// Replace with your actual email and password
const testEmail = 'your-email@company.com';
const testPassword = 'YourSecurePassword123';

console.log('Testing credentials...');
console.log('Email:', testEmail);

// Test 1: Check if auth account exists
const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
const authUser = authUsers?.users.find(u => u.email === testEmail);

if (!authUser) {
  console.error('❌ Auth account NOT found for:', testEmail);
  console.log('➡️ Create account via sign-up page or Supabase Dashboard');
} else {
  console.log('✅ Auth account exists, ID:', authUser.id);
}

// Test 2: Try login
const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
  email: testEmail,
  password: testPassword
});

if (loginError) {
  console.error('❌ Login failed:', loginError.message);
  if (loginError.message.includes('Invalid login credentials')) {
    console.log('➡️ PASSWORD IS WRONG - Reset it in Supabase Dashboard');
  }
} else {
  console.log('✅ Login successful!');
  console.log('User ID:', loginData.user.id);
}

// Test 3: Check user profile
const { data: profile, error: profileError } = await supabase
  .from('users')
  .select('*')
  .eq('email', testEmail)
  .single();

if (profileError) {
  console.error('❌ Profile NOT found:', profileError.message);
  console.log('➡️ Create profile in users table');
} else {
  console.log('✅ Profile exists:', profile);
  console.log('   Role:', profile.role);
  console.log('   Industry:', profile.industry_id);
}
```

**This will tell you exactly what's wrong!**

---

## Quick Counter IDs Reference

When setting `counter_id`, use these UUIDs:

**Banking:**
- `c1111111-1111-1111-1111-111111111111` (Counter 1)
- `c1111111-1111-1111-1111-111111111112` (Counter 2)
- `c1111111-1111-1111-1111-111111111113` (Counter 3)

**Healthcare:**
- `c2222222-2222-2222-2222-222222222221` (Reception 1)
- `c2222222-2222-2222-2222-222222222222` (Reception 2)

**Retail:**
- `c3333333-3333-3333-3333-333333333331` (Customer Service)
- `c3333333-3333-3333-3333-333333333332` (Returns Desk)

**Government:**
- `c4444444-4444-4444-4444-444444444441` (Window 1)
- `c4444444-4444-4444-4444-444444444442` (Window 2)

**Education:**
- `c5555555-5555-5555-5555-555555555551` (Admissions)
- `c5555555-5555-5555-5555-555555555552` (Financial Aid)

**Corporate:**
- `c6666666-6666-6666-6666-666666666661` (HR Desk)
- `c6666666-6666-6666-6666-666666666662` (IT Support)

---

## ✅ Checklist

- [ ] Account exists in Authentication → Users
- [ ] Profile exists in users table
- [ ] Role is set to `staff` (not `customer`)
- [ ] Industry_id is set (e.g., `banking`)
- [ ] Counter_id is set (UUID from list above)
- [ ] Password is correct
- [ ] Tried logging in at `/staff-portal`

---

## 💡 Quick Demo Account Test

To verify the login system works, try a demo account:

**Email:** `staff.banking@sqms.com`  
**Password:** `banking123`

If this works → Your login system is fine, just need to create your real account properly!

---

**Follow the steps above and you'll be logged in! Let me know which step you're on if you need help! 🎉**
