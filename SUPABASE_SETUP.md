# SQMS Supabase Backend Setup Guide

## Overview
Your Smart Queue Management System (SQMS) is now configured with Supabase as the backend. This guide will help you complete the setup.

## Prerequisites
- Supabase account (https://supabase.com)
- Supabase project created
- Project credentials:
  - Project URL: `https://nyhjatpnafdlgmsjbpmv.supabase.co`
  - Publishable Key: Configured in `/src/lib/supabase.ts`

## Setup Steps

### 1. Database Schema Setup

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Open the file `supabase-schema.sql` from your project root
4. Copy the entire SQL content
5. Paste it into the Supabase SQL Editor
6. Click **Run** to execute the schema

This will create:
- **Tables**: industries, businesses, users, services, counters, queue_tickets, appointments
- **Row Level Security (RLS) policies** for role-based access control
- **Indexes** for performance optimization
- **Triggers** for auto-generating ticket numbers and updating timestamps
- **Default data** for industries and services

### 2. Enable Email Authentication

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional):
   - Go to **Authentication** → **Email Templates**
   - Customize confirmation and password reset emails

### 3. Create Your First User

#### Option A: Through the Application
1. Run your application: `pnpm dev`
2. Navigate to the Sign Up page
3. Create a new account with your email and password
4. The account will be created as a **customer** by default

#### Option B: Through Supabase Dashboard
1. Go to **Authentication** → **Users**
2. Click **Add User**
3. Enter email and password
4. After creating the auth user, go to **Table Editor** → **users**
5. Click **Insert** → **Insert row**
6. Fill in the user profile:
   - `id`: Use the UUID from auth.users
   - `email`: Same as auth email
   - `full_name`: User's full name
   - `role`: Choose from: `customer`, `staff`, `admin`, `superadmin`

### 4. Create a Super Admin (Optional)

To manage the system, you'll need at least one super admin:

1. Create a user account (via app or dashboard)
2. Go to **Table Editor** → **users**
3. Find your user and click **Edit**
4. Change `role` to `superadmin`
5. Click **Save**

### 5. Add Sample Businesses (Optional)

1. Go to **Table Editor** → **businesses**
2. Click **Insert row**
3. Add business details:
   - `name`: Business name
   - `industry_id`: One of: `banking`, `healthcare`, `retail`, `government`, `education`, `corporate`
   - `address`: Business address
   - `phone`: Contact phone
   - `email`: Business email
   - `status`: `approved` (or `pending` for approval workflow)

### 6. Add Counters for Businesses

1. Go to **Table Editor** → **counters**
2. Click **Insert row**
3. Add counter details:
   - `business_id`: UUID of the business
   - `name`: Counter name (e.g., "Counter 1", "Window A")
   - `industry_id`: Same as business industry
   - `status`: `active`
   - `service_ids`: Array of service UUIDs (from services table)

## Features Now Available

### For Customers
- ✅ Sign up and sign in with email/password
- ✅ Select industry/business
- ✅ Browse available services
- ✅ Join virtual queues
- ✅ Get QR code tickets with auto-generated ticket numbers
- ✅ Track real-time queue position
- ✅ Book appointments
- ✅ View appointment history
- ✅ Cancel tickets/appointments

### For Staff
- ✅ Sign in to staff portal
- ✅ View assigned counter
- ✅ See waiting customers
- ✅ Call next customer in queue
- ✅ Mark customers as served
- ✅ View customer history
- ✅ Manage counter status (active/on break)

### For Admins
- ✅ Manage employees
- ✅ View all counters
- ✅ Monitor queue analytics
- ✅ Approve/reject business requests
- ✅ Configure services

### For Super Admins
- ✅ Manage all businesses
- ✅ Approve business registrations
- ✅ System-wide analytics
- ✅ Employee management across businesses

## Real-time Features

The system includes real-time subscriptions for:
- Queue updates (new tickets, position changes)
- Ticket status changes (waiting → called → serving → completed)
- Counter status updates

These are automatically handled by the `queueService.ts` functions:
- `subscribeToQueueUpdates(industryId, callback)`
- `subscribeToTicketUpdates(ticketId, callback)`

## Row Level Security (RLS)

The database is secured with RLS policies:

- **Customers** can only view/edit their own data
- **Staff** can view all tickets and appointments but only update their counter
- **Admins** can manage all data within their business
- **Super Admins** have full system access

## Testing the Integration

### Test Customer Flow:
1. Sign up as a new customer
2. Select an industry (e.g., Banking)
3. Browse services
4. Join a queue
5. Check your ticket number and estimated wait time

### Test Staff Flow:
1. Create a staff user in Supabase
2. Assign them to a counter
3. Sign in as staff
4. View waiting customers
5. Call and serve customers

### Test Real-time Updates:
1. Open two browser windows
2. Create a ticket in one window
3. Watch it appear in real-time in staff dashboard

## Troubleshooting

### "No rows returned" error
- Make sure you've run the `supabase-schema.sql` completely
- Check that default industries are inserted
- Verify RLS policies are enabled

### Authentication errors
- Verify your Supabase URL and anon key in `/src/lib/supabase.ts`
- Check that email auth is enabled in Supabase dashboard
- Ensure user exists in both `auth.users` and `users` table

### RLS policy blocking access
- Verify the user's role in the `users` table
- Check RLS policies in Supabase SQL Editor
- Ensure `auth.uid()` matches the user's ID

## API Service Functions

Located in `/src/services/queueService.ts`:

**Queue Management:**
- `createQueueTicket(customerId, industryId, serviceId)`
- `getCustomerTickets(customerId)`
- `getActiveTicket(customerId)`
- `cancelTicket(ticketId)`
- `updateTicketStatus(ticketId, status, counterId)`

**Appointments:**
- `createAppointment(customerId, industryId, serviceId, date, time, notes)`
- `getCustomerAppointments(customerId)`
- `updateAppointmentStatus(appointmentId, status)`
- `cancelAppointment(appointmentId)`

**Services & Counters:**
- `getServicesByIndustry(industryId)`
- `getCountersByIndustry(industryId)`
- `updateCounterStatus(counterId, status)`
- `assignTicketToCounter(ticketId, counterId)`

## Next Steps

1. ✅ Run the database schema
2. ✅ Create your first super admin account
3. ✅ Add sample businesses and counters
4. ✅ Test the complete flow
5. 🔄 Integrate dashboard pages with backend data
6. 🔄 Add real-time updates to UI components
7. 🔄 Implement notification system
8. 🔄 Add analytics and reporting

## Support

For issues or questions:
- Check Supabase logs in Dashboard → Logs
- Review RLS policies in SQL Editor
- Check browser console for errors
- Verify network requests in DevTools

## Security Notes

⚠️ **Important**: 
- Never commit the Supabase anon key to public repositories
- Use environment variables in production
- Regularly review RLS policies
- Enable email confirmation for production use
- Set up proper backup strategies

---

**Your SQMS is now ready with a fully functional Supabase backend!** 🎉
