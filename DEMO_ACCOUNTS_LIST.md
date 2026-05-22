# 🔑 Demo Accounts Reference

This document lists all demo accounts available in the SQMS system.

---

## 🔴 Superadmin Account

**Full System Access** - Can manage all industries, businesses, and users

| Field | Value |
|-------|-------|
| **Email** | `superadmin@sqms.com` |
| **Password** | `super123` |
| **Name** | Super Admin |
| **Access** | Full system (all industries) |
| **Login URL** | `/staff-portal` |

**What superadmin can do:**
- Manage all industries
- Approve/reject business requests
- Manage all employees across all businesses
- View system-wide analytics
- Access admin panel for all industries

---

## 🟢 Admin Accounts (By Industry)

Admin accounts have full control over their specific industry.

### Banking & Finance Admin
| Field | Value |
|-------|-------|
| **Email** | `admin.banking@sqms.com` |
| **Password** | `admin123` |
| **Industry** | Banking & Finance |
| **Login URL** | `/staff-portal` |

### Healthcare Admin
| Field | Value |
|-------|-------|
| **Email** | `admin.healthcare@sqms.com` |
| **Password** | `admin123` |
| **Industry** | Healthcare |
| **Login URL** | `/staff-portal` |

### Retail Admin
| Field | Value |
|-------|-------|
| **Email** | `admin.retail@sqms.com` |
| **Password** | `admin123` |
| **Industry** | Retail |
| **Login URL** | `/staff-portal` |

### Government Services Admin
| Field | Value |
|-------|-------|
| **Email** | `admin.government@sqms.com` |
| **Password** | `admin123` |
| **Industry** | Government Services |
| **Login URL** | `/staff-portal` |

### Education Admin
| Field | Value |
|-------|-------|
| **Email** | `admin.education@sqms.com` |
| **Password** | `admin123` |
| **Industry** | Education |
| **Login URL** | `/staff-portal` |

### Corporate Office Admin
| Field | Value |
|-------|-------|
| **Email** | `admin.corporate@sqms.com` |
| **Password** | `admin123` |
| **Industry** | Corporate Office |
| **Login URL** | `/staff-portal` |

**What industry admins can do:**
- Manage services for their industry
- Manage employees in their industry
- Manage counters and branches
- View appointments and queue tickets
- View industry analytics
- Cannot access other industries

---

## 🔵 Staff Accounts (By Industry)

Staff accounts are assigned to specific counters and handle customer service.

### Banking Staff
| Field | Value |
|-------|-------|
| **Email** | `staff.banking@sqms.com` |
| **Password** | `banking123` |
| **Name** | Sarah Johnson |
| **Industry** | Banking & Finance |
| **Login URL** | `/staff-portal` |

### Healthcare Staff
| Field | Value |
|-------|-------|
| **Email** | `staff.healthcare@sqms.com` |
| **Password** | `healthcare123` |
| **Name** | Dr. Michael Chen |
| **Industry** | Healthcare |
| **Login URL** | `/staff-portal` |

### Retail Staff
| Field | Value |
|-------|-------|
| **Email** | `staff.retail@sqms.com` |
| **Password** | `retail123` |
| **Name** | Emily Rodriguez |
| **Industry** | Retail |
| **Login URL** | `/staff-portal` |

### Government Staff
| Field | Value |
|-------|-------|
| **Email** | `staff.government@sqms.com` |
| **Password** | `government123` |
| **Name** | James Wilson |
| **Industry** | Government Services |
| **Login URL** | `/staff-portal` |

### Education Staff
| Field | Value |
|-------|-------|
| **Email** | `staff.education@sqms.com` |
| **Password** | `education123` |
| **Name** | Linda Martinez |
| **Industry** | Education |
| **Login URL** | `/staff-portal` |

### Corporate Staff
| Field | Value |
|-------|-------|
| **Email** | `staff.corporate@sqms.com` |
| **Password** | `corporate123` |
| **Name** | Robert Taylor |
| **Industry** | Corporate Office |
| **Login URL** | `/staff-portal` |

**What staff can do:**
- View their assigned counter's queue
- Call next customer
- Serve customers
- Mark tickets as complete
- View/manage appointments for their services
- Cannot access admin panel

---

## 📝 How These Accounts Work

### Demo Mode (No Supabase Setup)
All these accounts work **out of the box** without any Supabase setup. They're hardcoded in the application for demo purposes.

**How to use in demo mode:**
1. Go to `/staff-portal`
2. Enter any email/password from the lists above
3. Click "Login"
4. You'll be logged in and redirected to the appropriate dashboard

### Production Mode (With Supabase)
To use these accounts with a real Supabase backend:

1. **Create auth accounts** in Supabase Dashboard:
   - Go to Authentication → Users → Add User
   - Use the emails and passwords from above
   - Enable "Auto Confirm User"

2. **Create user profiles** using the SQL file:
   - Open `CREATE_DEMO_ADMIN_ACCOUNTS.sql`
   - Follow the instructions to create profiles

3. **Login** at `/staff-portal` with the credentials

---

## 🎯 Quick Testing Scenarios

### Test Superadmin Access
```
Email: superadmin@sqms.com
Password: super123
Expected: Access to all industries, business requests, employees
```

### Test Industry Admin
```
Email: admin.banking@sqms.com
Password: admin123
Expected: Access to banking admin panel, employees, services
```

### Test Staff Counter
```
Email: staff.banking@sqms.com
Password: banking123
Expected: Access to counter queue, appointments, serve customers
```

---

## 🔐 Security Notes

**IMPORTANT:** These are demo accounts with simple passwords.

**For Production:**
1. ❌ Do NOT use these accounts in production
2. ❌ Do NOT use passwords like "admin123" or "super123"
3. ✅ Create unique, strong passwords for real accounts
4. ✅ Use proper email addresses for real users
5. ✅ Enable email verification in production
6. ✅ Implement password reset functionality

---

## 📊 Account Summary Table

| Role | Count | Login URL | Access Level |
|------|-------|-----------|--------------|
| Superadmin | 1 | `/staff-portal` | All industries |
| Admin | 6 | `/staff-portal` | Single industry |
| Staff | 6 | `/staff-portal` | Assigned counter |
| **Total** | **13** | | |

---

## 🆘 Troubleshooting

### "Invalid email or password"
- ✅ Make sure you're using the exact email (case-sensitive)
- ✅ Check the password (no extra spaces)
- ✅ If using Supabase, make sure the account is created in Authentication

### "Access denied"
- ✅ Make sure the user profile exists in the `users` table
- ✅ Verify the role is set correctly (`admin` or `superadmin`)
- ✅ Check that `industry_id` is set for industry admins

### Admin page not showing
- ✅ Verify role is `admin` or `superadmin` in database
- ✅ Run `FIX_USER_ROLE_ENUM.sql` to ensure enum values exist
- ✅ Check browser console for errors

---

**All accounts are ready to use! Pick the one that matches your testing needs.** 🎉
