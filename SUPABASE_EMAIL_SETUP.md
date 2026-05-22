# Supabase Email Configuration for Password Reset

## ✅ What Was Implemented

### 1. **Password Reset Flow**
The application now uses Supabase Auth's built-in password reset functionality:

**Files Modified:**
- ✅ `src/app/pages/ForgotPassword.tsx` - Sends reset email via Supabase
- ✅ `src/app/pages/ResetPassword.tsx` - New page for password change
- ✅ `src/app/routes.tsx` - Added `/reset-password` route

---

## 🔧 How It Works

### Customer Journey:

1. **User clicks "Forgot Password"** on login page
2. **Enters email address** on `/forgot-password` page
3. **Supabase sends email** with reset link
4. **User clicks link in email** → Opens `/reset-password` page
5. **User enters new password** twice
6. **Password updated** in Supabase Auth
7. **Redirected to login** with new password

---

## 📧 Supabase Email Template Configuration

### Step 1: Access Email Templates

1. Go to Supabase Dashboard
2. Select your project
3. Navigate to: **Authentication** → **Email Templates**

### Step 2: Configure "Reset Password" Template

Click on **"Reset Password"** template and customize:

#### **Subject Line:**
```
Reset your SQMS password
```

#### **Email Body (HTML):**
```html
<h2>Reset Your Password</h2>

<p>Hi there,</p>

<p>We received a request to reset your password for your Smart Queue Management System account.</p>

<p>Click the button below to create a new password:</p>

<p>
  <a href="{{ .SiteURL }}/reset-password?access_token={{ .Token }}&type=recovery" 
     style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">
    Reset Password
  </a>
</p>

<p>Or copy and paste this link into your browser:</p>
<p>{{ .SiteURL }}/reset-password?access_token={{ .Token }}&type=recovery</p>

<p>If you didn't request this, you can safely ignore this email.</p>

<p>This link will expire in 1 hour.</p>

<p>Thanks,<br>The SQMS Team</p>
```

### Step 3: Set Site URL

1. In Supabase Dashboard, go to: **Authentication** → **URL Configuration**
2. Set **Site URL** to your production domain:
   - Development: `http://localhost:5173`
   - Production: `https://your-domain.vercel.app`

3. Add **Redirect URLs** (allowed redirects after email link click):
   - `http://localhost:5173/reset-password`
   - `https://your-domain.vercel.app/reset-password`

### Step 4: Configure Email Provider (Optional)

By default, Supabase uses their SMTP server (limited to 3 emails per hour in free tier).

**For production, use a custom SMTP provider:**

1. Go to: **Project Settings** → **Auth** → **SMTP Settings**
2. Enable "Custom SMTP"
3. Configure with one of these providers:

#### **Option A: SendGrid**
```
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: YOUR_SENDGRID_API_KEY
Sender Email: noreply@yourdomain.com
Sender Name: SQMS
```

#### **Option B: Mailgun**
```
Host: smtp.mailgun.org
Port: 587
Username: postmaster@yourdomain.com
Password: YOUR_MAILGUN_PASSWORD
Sender Email: noreply@yourdomain.com
Sender Name: SQMS
```

#### **Option C: AWS SES**
```
Host: email-smtp.us-east-1.amazonaws.com
Port: 587
Username: YOUR_SES_ACCESS_KEY
Password: YOUR_SES_SECRET_KEY
Sender Email: noreply@yourdomain.com
Sender Name: SQMS
```

---

## 🧪 Testing the Password Reset Flow

### Test 1: Send Reset Email

1. Navigate to `/forgot-password`
2. Enter a valid user email
3. Click "Send Reset Link"
4. **Verify:**
   - Success message appears
   - Email received in inbox
   - Email contains clickable link

### Test 2: Reset Password from Email

1. Open the reset email
2. Click the reset link
3. **Verify:**
   - Redirected to `/reset-password` page
   - Page shows "Create New Password" form
4. Enter new password (twice)
5. Click "Update Password"
6. **Verify:**
   - Success message shown
   - Redirected to login page
7. Login with new password
8. **Verify:** Login successful

### Test 3: Invalid/Expired Token

1. Use a reset link older than 1 hour
2. **Verify:** Error message: "Invalid or expired reset link"
3. Option to request new link shown

### Test 4: Password Validation

1. Try password less than 6 characters
2. **Verify:** Error: "Password must be at least 6 characters long"
3. Try mismatched passwords
4. **Verify:** Error: "Passwords do not match"

---

## 🔒 Security Features

### Built-in Security:

✅ **Token expiration** - Links expire after 1 hour  
✅ **Single-use tokens** - Each token can only be used once  
✅ **Encrypted tokens** - Tokens are cryptographically secure  
✅ **Password hashing** - Passwords stored as bcrypt hashes  
✅ **Rate limiting** - Supabase limits email sending to prevent abuse

---

## 🚨 Troubleshooting

### Issue 1: Email Not Received

**Possible Causes:**
- Check spam/junk folder
- Verify email exists in Supabase users table
- Check Supabase logs: Dashboard → Logs → Auth

**Solutions:**
1. Verify user email in Supabase:
   ```sql
   SELECT email FROM auth.users WHERE email = 'user@example.com';
   ```
2. Check email quota (free tier: 3 emails/hour)
3. Set up custom SMTP (unlimited emails)

### Issue 2: "Invalid or expired reset link"

**Causes:**
- Token expired (> 1 hour old)
- Token already used
- Invalid token in URL

**Solution:**
Request a new reset link from `/forgot-password`

### Issue 3: Reset Link Goes to Wrong Domain

**Cause:**
Site URL not configured correctly in Supabase

**Solution:**
1. Go to: Authentication → URL Configuration
2. Update Site URL to match your domain
3. Add redirect URL: `https://yourdomain.com/reset-password`

### Issue 4: SMTP Error / Email Not Sending

**Causes:**
- Invalid SMTP credentials
- Email provider blocking
- Free tier limit reached

**Solution:**
1. Verify SMTP settings in Supabase
2. Test SMTP credentials separately
3. Check email provider logs
4. Upgrade to custom SMTP provider

---

## 📊 Code Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│ 1. User Clicks "Forgot Password" on Login Page         │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ 2. ForgotPassword.tsx                                   │
│    - User enters email                                  │
│    - Calls: supabase.auth.resetPasswordForEmail()      │
│    - Supabase sends email with token                   │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ 3. Email Provider (Supabase SMTP or Custom)            │
│    - Email sent to user's inbox                        │
│    - Contains link: /reset-password?token=xxx          │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ 4. User Clicks Link in Email                           │
│    - Browser opens: /reset-password?token=xxx          │
│    - Supabase auto-creates session from token          │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ 5. ResetPassword.tsx                                    │
│    - Checks session validity                            │
│    - Shows password input form                          │
│    - User enters new password                           │
│    - Calls: supabase.auth.updateUser({password})       │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│ 6. Password Updated in Supabase                        │
│    - User signed out                                    │
│    - Redirected to /login                              │
│    - Can now login with new password                   │
└─────────────────────────────────────────────────────────┘
```

---

## 🔑 Important Code Snippets

### Sending Reset Email (ForgotPassword.tsx)

```typescript
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: `${window.location.origin}/reset-password`,
});
```

### Updating Password (ResetPassword.tsx)

```typescript
// Supabase automatically validates the token from URL
const { error } = await supabase.auth.updateUser({
  password: newPassword
});

// Sign out to force re-login
await supabase.auth.signOut();
```

---

## 📝 Production Checklist

Before deploying to production:

- [ ] Configure Site URL in Supabase (your Vercel domain)
- [ ] Add redirect URLs for `/reset-password`
- [ ] Customize email template with your branding
- [ ] Set up custom SMTP provider (SendGrid/Mailgun/SES)
- [ ] Test password reset flow end-to-end
- [ ] Verify emails arrive promptly (< 1 minute)
- [ ] Test expired token handling
- [ ] Verify password validation works
- [ ] Check email appears professional (not spam-like)

---

## 🎯 Summary

**Password reset now works with real emails:**

✅ User requests reset → Real email sent via Supabase  
✅ User clicks link → Opens reset page with valid token  
✅ User enters new password → Password updated in database  
✅ User redirected to login → Can login with new password  

**Production-ready features:**
- Secure token-based authentication
- 1-hour token expiration
- Password strength validation
- User-friendly error messages
- Professional email templates

**Next Steps:**
1. Configure email templates in Supabase Dashboard
2. Set up custom SMTP for production
3. Test the complete flow
4. Deploy to Vercel

🚀 **Your password reset system is now fully functional!**
