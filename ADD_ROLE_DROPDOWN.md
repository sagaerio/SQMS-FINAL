# 🎯 Add Role Dropdown in Supabase

This guide will add a dropdown menu for the `role` field in Supabase Table Editor, so you can easily select between customer, staff, admin, or superadmin.

---

## 🚀 Quick Setup (2 minutes)

### Step 1: Run the Migration

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. Copy the entire contents of `supabase/migrations/004_role_enum.sql`
4. Paste and click **Run**

**Expected Result:** "Success. No rows returned"

---

### Step 2: Verify It Works

1. Go to **Table Editor** → **users** table
2. Click **Insert** → **Insert row** (or edit an existing user)
3. Click on the **role** field
4. ✅ **You should now see a dropdown with 4 options:**
   - customer
   - staff
   - admin
   - superadmin

---

## 📋 What This Does

**Before:**
- Role field is plain text
- You have to manually type: `customer`, `staff`, `admin`, or `superadmin`
- Risk of typos (e.g., typing `staf` instead of `staff`)

**After:**
- Role field shows as a dropdown
- Click to select from predefined options
- No typos possible
- Faster editing

---

## 🔍 Technical Details

The migration:
1. Creates a PostgreSQL ENUM type called `user_role`
2. Converts the existing `role` column from `TEXT` to `user_role` ENUM
3. Preserves all existing data
4. Supabase UI automatically detects ENUMs and shows them as dropdowns

---

## ⚠️ Important Notes

- **Safe to run multiple times** - The migration checks if the ENUM already exists
- **Preserves existing data** - All current user roles remain unchanged
- **Compatible with your app** - The values are exactly the same (customer, staff, admin, superadmin)
- **No code changes needed** - Your React app will work exactly as before

---

## 🧪 Test It

After running the migration:

**1. Edit an existing user:**
```
- Go to Table Editor → users
- Click Edit on any user
- Click the role field
- You should see a dropdown!
```

**2. Create a new user:**
```
- Click Insert row
- Fill in the fields
- For role, select from dropdown
- Save
```

**3. Update via SQL (still works):**
```sql
UPDATE users 
SET role = 'staff'
WHERE email = 'test@email.com';
```

---

## 🔧 If You Get Errors

### "type user_role already exists"
✅ This is fine! It means the ENUM was already created. The migration handles this.

### "column role_new already exists"
Run this to reset:
```sql
ALTER TABLE users DROP COLUMN IF EXISTS role_new;
```
Then run the migration again.

### Role dropdown not showing
1. Refresh your browser (Ctrl+Shift+R or Cmd+Shift+R)
2. Try in an incognito window
3. Clear your browser cache

---

## 📊 Verify the ENUM is Active

Run this query:
```sql
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'role';
```

**Expected result:**
```
column_name | data_type    | udt_name
role        | USER-DEFINED | user_role
```

If `data_type` is `USER-DEFINED` and `udt_name` is `user_role`, it's working! ✅

---

**That's it! You now have a dropdown for roles in Supabase! 🎉**
