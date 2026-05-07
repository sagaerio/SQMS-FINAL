# Supabase Integration Guide - SQMS

## Overview

Your Smart Queue Management System (SQMS) is now integrated with Supabase for backend services, authentication, real-time updates, and data persistence.

## Connection Details

**Supabase Project URL:** `https://nyhjatpnafdlgmsjbpmv.supabase.co`  
**Configuration File:** `/src/lib/supabase.ts`

## Database Schema

Your database includes the following tables:

### Core Tables

1. **users** - User authentication and profiles
   - Stores user information with role-based access (customer, staff, admin, superadmin)
   - Links to auth.users via id (UUID)

2. **industries** - Available service industries
   - Banking, Healthcare, Retail, Government, Education, Corporate, etc.
   - Contains name, icon, color, and description

3. **services** - Services offered by industry
   - Each service belongs to an industry
   - Includes estimated time, description, and active status

4. **businesses** - Business/branch locations
   - Multi-branch support with approval workflow
   - Links to industries and admin users

5. **counters** - Service counters
   - Assigned to specific businesses and industries
   - Can be assigned to staff members
   - Tracks current status and current ticket being served

6. **queue_tickets** - Virtual queue tickets
   - Created when customers join a queue
   - Tracks position, wait time, and status
   - Links to customer, service, industry, and counter

7. **appointments** - Scheduled appointments
   - Pre-booked service appointments
   - Tracks date, time, status, and notes
   - Links to customer, service, staff, and counter

## What's Already Integrated

### ✅ Authentication (`/src/contexts/AuthContext.tsx`)
- User sign up, sign in, and sign out
- Profile loading and updates
- Session management
- Role-based access control

### ✅ Industries (`/src/app/contexts/IndustryContext.tsx`)
- Loads industries from Supabase
- Falls back to mock data if no industries exist in database
- Provides global industry context to the app

### ✅ Services (`/src/app/components/ServiceSelection.tsx`)
- Loads services by industry from Supabase
- Falls back to mock data if no services exist
- Used throughout the app for service selection

### ✅ Appointments (`/src/app/pages/Appointments.tsx`)
- Create new appointments
- View customer appointments
- Update appointment status (confirmed, completed, cancelled)
- Cancel and reschedule appointments

### ✅ Queue Tickets (`/src/app/pages/Services.tsx`)
- Join virtual queue (creates ticket)
- Check for active tickets
- Display QR codes for tickets

### ✅ Service Layer (`/src/services/queueService.ts`)
Comprehensive functions for all database operations:

**Queue Tickets:**
- `createQueueTicket()` - Join queue
- `getCustomerTickets()` - Get all customer tickets
- `getActiveTicket()` - Get current active ticket
- `cancelTicket()` - Cancel a ticket
- `getQueueByIndustry()` - Get all tickets in industry queue
- `updateTicketStatus()` - Update ticket status

**Appointments:**
- `createAppointment()` - Book appointment
- `getCustomerAppointments()` - Get customer appointments
- `updateAppointmentStatus()` - Update status
- `cancelAppointment()` - Cancel appointment

**Services:**
- `getServicesByIndustry()` - Get services for industry
- `getAllServices()` - Get all services

**Counters:**
- `getCountersByIndustry()` - Get counters for industry
- `updateCounterStatus()` - Update counter status
- `assignTicketToCounter()` - Assign ticket to counter

**Industries:**
- `getAllIndustries()` - Get all industries

**Real-time Subscriptions:**
- `subscribeToQueueUpdates()` - Subscribe to queue changes
- `subscribeToTicketUpdates()` - Subscribe to ticket changes

## Component Integration Map

| Component/Page | Supabase Integration | Status |
|----------------|---------------------|---------|
| AuthContext | ✅ Full | Users table, Supabase Auth |
| IndustryContext | ✅ Full | Industries table |
| ServiceSelection | ✅ Full | Services table |
| Appointments | ✅ Full | Appointments, Services tables |
| Services (Join Queue) | ✅ Full | Queue Tickets, Services tables |
| Dashboard | ✅ Partial | Uses Services via ServiceSelection |
| VirtualQueue | ⚠️ Needs Update | Currently uses mock data |
| QueueStatus | ⚠️ Needs Update | Currently uses localStorage |
| StaffDashboard | ⚠️ Needs Update | Currently uses mock data |
| AdminDashboard | ⚠️ Needs Update | Currently uses mock data |

## Setting Up Your Database

### Step 1: Populate Industries

Run this SQL in your Supabase SQL Editor:

```sql
INSERT INTO industries (name, icon, color, description) VALUES
('Banking', '🏦', 'from-blue-600 to-blue-700', 'Financial services and banking'),
('Healthcare', '❤️', 'from-red-600 to-pink-600', 'Medical and healthcare services'),
('Retail', '🛍️', 'from-purple-600 to-purple-700', 'Retail and shopping services'),
('Government', '🏛️', 'from-teal-600 to-teal-700', 'Government and public services'),
('Education', '🎓', 'from-orange-600 to-orange-700', 'Educational institutions'),
('Corporate', '💼', 'from-slate-600 to-slate-700', 'Corporate office services');
```

### Step 2: Populate Services

After adding industries, get their IDs and add services:

```sql
-- Get industry IDs first
SELECT id, name FROM industries;

-- Add services for Banking (replace 'industry-id-here' with actual ID)
INSERT INTO services (industry_id, name, description, estimated_time, is_active) VALUES
('industry-id-here', 'Account Opening', 'Open a new bank account', 15, true),
('industry-id-here', 'Loan Inquiry', 'Inquire about loan options', 20, true),
('industry-id-here', 'Investment Consultation', 'Discuss investment opportunities', 30, true),
('industry-id-here', 'Card Services', 'Credit/debit card services', 10, true),
('industry-id-here', 'General Banking Inquiry', 'General banking questions', 10, true);

-- Repeat for other industries...
```

### Step 3: Create a Test User

Use the Supabase Authentication UI or run:

```sql
-- After creating user via Supabase Auth UI, update their profile
INSERT INTO users (id, email, full_name, role) VALUES
('auth-user-id-here', 'test@example.com', 'Test User', 'customer');
```

## Real-Time Features

### Queue Updates
Subscribe to real-time queue changes:

```typescript
import { subscribeToQueueUpdates } from '../services/queueService';

const subscription = subscribeToQueueUpdates(industryId, (payload) => {
  console.log('Queue update:', payload);
  // Update UI with new data
});

// Clean up
subscription.unsubscribe();
```

### Ticket Updates
Subscribe to specific ticket updates:

```typescript
import { subscribeToTicketUpdates } from '../services/queueService';

const subscription = subscribeToTicketUpdates(ticketId, (payload) => {
  console.log('Ticket update:', payload);
  // Update UI with new status
});

// Clean up
subscription.unsubscribe();
```

## Next Steps

### Pages Needing Integration

1. **VirtualQueue** (`/src/app/pages/VirtualQueue.tsx`)
   - Currently uses mock data from `businessTypes.ts`
   - Needs to fetch services and branches from Supabase
   - Should use `createQueueTicket()` to join queue

2. **QueueStatus** (`/src/app/pages/QueueStatus.tsx`)
   - Currently uses localStorage
   - Needs to fetch tickets from Supabase
   - Should use real-time subscriptions for live updates

3. **StaffDashboard** (`/src/app/pages/StaffDashboard.tsx`)
   - Currently uses mock data
   - Needs to fetch assigned counter and queue
   - Should use real-time subscriptions
   - Needs to integrate with counter assignment

4. **AdminDashboard** (`/src/app/pages/AdminDashboard.tsx`)
   - Needs business management integration
   - Should manage counters, staff assignments, and services

## Security Considerations

### Row Level Security (RLS)

Ensure RLS policies are enabled for all tables:

```sql
-- Example: Users can only see their own appointments
CREATE POLICY "Users can view own appointments" ON appointments
  FOR SELECT USING (auth.uid() = customer_id);

-- Example: Staff can view queue for their industry
CREATE POLICY "Staff can view industry queue" ON queue_tickets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.industry_id = queue_tickets.industry_id
      AND users.role IN ('staff', 'admin', 'superadmin')
    )
  );
```

## Troubleshooting

### Common Issues

1. **"No industries loading"**
   - Check that industries exist in database
   - Verify Supabase URL and key in `/src/lib/supabase.ts`
   - Check browser console for errors

2. **"Services not showing"**
   - Ensure services exist for the selected industry
   - Check that `is_active` is `true` for services
   - Verify industry_id matches

3. **"Authentication failing"**
   - Check email confirmation settings in Supabase Auth
   - Verify user exists in both `auth.users` and `users` table
   - Check RLS policies aren't blocking access

4. **"Real-time not working"**
   - Enable Realtime in Supabase dashboard for required tables
   - Check subscription is properly set up
   - Verify RLS policies allow SELECT on tables

## API Reference

See `/src/services/queueService.ts` for complete API documentation of all available functions.

## Support

For issues specific to:
- **Supabase**: Check [Supabase Documentation](https://supabase.com/docs)
- **Database Schema**: Review table definitions in Supabase Table Editor
- **Authentication**: Check Supabase Authentication settings

---

**Last Updated:** April 24, 2026
