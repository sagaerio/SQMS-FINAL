# Quick Email Setup Guide - Copy & Paste Ready

## 🚀 5-Minute Setup for Password Reset Emails

### Step 1: Supabase Dashboard → Authentication → Email Templates

**Navigate to:** https://app.supabase.com/project/YOUR_PROJECT/auth/templates

---

### Step 2: Click "Reset Password" Template

Copy and paste these settings:

#### **Subject:**
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
<p style="color: #2563eb;">{{ .SiteURL }}/reset-password?access_token={{ .Token }}&type=recovery</p>

<p><small>If you didn't request this, you can safely ignore this email.</small></p>

<p><small>This link will expire in 1 hour.</small></p>

<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">

<p><small style="color: #6b7280;">Thanks,<br>The SQMS Team</small></p>
```

---

### Step 3: Configure URLs

**Navigate to:** Authentication → URL Configuration

#### **Site URL:**
```
https://your-vercel-app.vercel.app
```
(Replace with your actual Vercel URL)

#### **Redirect URLs (Add both):**
```
http://localhost:5173/reset-password
https://your-vercel-app.vercel.app/reset-password
```

**Click:** "Add URL" for each redirect URL

---

### Step 4: Test Locally (Optional)

For local testing, temporarily set:

**Site URL:**
```
http://localhost:5173
```

**Don't forget to change back to production URL when deploying!**

---

## ✅ Verification Checklist

After setup, test the flow:

1. **Go to:** `http://localhost:5173/forgot-password`
2. **Enter:** A real user email from your Supabase users table
3. **Click:** "Send Reset Link"
4. **Check:** Email inbox (might take 1-2 minutes on free tier)
5. **Click:** Reset link in email
6. **Verify:** Opens `/reset-password` page
7. **Enter:** New password (minimum 6 characters)
8. **Click:** "Update Password"
9. **Verify:** Redirects to login
10. **Login:** Use new password

---

## 🔧 Common Issues & Quick Fixes

### "Email not received"
**Fix:** Check spam folder, or use custom SMTP (see below)

### "Invalid or expired reset link"
**Fix:** Request new link (tokens expire in 1 hour)

### "Wrong URL in email"
**Fix:** Verify Site URL matches your domain exactly

---

## 📧 Upgrade to Custom SMTP (Recommended for Production)

**Navigate to:** Project Settings → Auth → SMTP Settings

**Toggle:** Enable "Custom SMTP"

### Quick Setup with SendGrid (Free 100 emails/day):

1. **Sign up:** https://sendgrid.com/
2. **Create API Key:** Settings → API Keys → Create API Key
3. **Copy key** and paste below:

```
SMTP Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: YOUR_SENDGRID_API_KEY
Sender Email: noreply@yourdomain.com
Sender Name: SQMS
```

**Click:** "Save"

---

## 🎨 Optional: Branded Email Template

Want a prettier email? Use this enhanced version:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  
  <div style="background: linear-gradient(135deg, #2563eb 0%, #14b8a6 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">SQMS</h1>
    <p style="color: rgba(255,255,255,0.9); margin: 5px 0 0 0;">Smart Queue Management System</p>
  </div>
  
  <div style="background: white; padding: 40px 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
    <h2 style="color: #1e293b; margin-top: 0;">Reset Your Password</h2>
    
    <p>Hi there,</p>
    
    <p>We received a request to reset your password for your SQMS account.</p>
    
    <p>Click the button below to create a new password:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="{{ .SiteURL }}/reset-password?access_token={{ .Token }}&type=recovery" 
         style="display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3);">
        Reset My Password
      </a>
    </div>
    
    <p style="font-size: 14px; color: #6b7280;">Or copy and paste this link into your browser:</p>
    <p style="font-size: 13px; color: #2563eb; word-break: break-all; background: #f3f4f6; padding: 12px; border-radius: 6px;">{{ .SiteURL }}/reset-password?access_token={{ .Token }}&type=recovery</p>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
      <p style="font-size: 13px; color: #6b7280; margin: 5px 0;">
        <strong>Didn't request this?</strong> You can safely ignore this email.
      </p>
      <p style="font-size: 13px; color: #6b7280; margin: 5px 0;">
        <strong>Link expires in:</strong> 1 hour
      </p>
    </div>
  </div>
  
  <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
    <p>© 2026 SQMS - Smart Queue Management System</p>
  </div>
  
</body>
</html>
```

---

## ✨ You're Done!

Password reset emails are now fully functional! 🎉

**What happens now:**
1. User forgets password → Clicks "Forgot Password"
2. Enters email → Receives professional reset email
3. Clicks link → Opens reset page
4. Enters new password → Password updated
5. Logs in with new password → Success! ✅

---

## 🆘 Need Help?

**Check logs:** Supabase Dashboard → Logs → Auth Logs

**Test email delivery:** Send yourself a test reset email

**Verify users exist:** 
```sql
SELECT email, created_at FROM auth.users ORDER BY created_at DESC LIMIT 10;
```

---

**That's it! Your password reset system is production-ready! 🚀**
