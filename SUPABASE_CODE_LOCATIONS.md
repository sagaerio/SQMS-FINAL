# Supabase Code Integration - Quick Reference

## Pages with Full Supabase Integration ✅

### 1. Login Page (`/src/app/pages/Login.tsx`)
**Supabase Code:**
```typescript
import { useAuth } from '../../contexts/AuthContext';

const { signIn, user } = useAuth();

const handleLogin = async (e: React.FormEvent) => {
  const { error: signInError } = await signIn(email, password);
  // Handles real authentication
};
```
**What it does:** Uses Supabase auth to sign in users with email/password

---

### 2. Sign Up Page (`/src/app/pages/SignUp.tsx`)
**Supabase Code:**
```typescript
import { useAuth } from '../../contexts/AuthContext';

const { signUp } = useAuth();

const handleSignUp = async (e: React.FormEvent) => {
  const fullName = `${formData.firstName} ${formData.lastName}`;
  const { error: signUpError } = await signUp(
    formData.email,
    formData.password,
    fullName,
    'customer'
  );
  // Creates user in auth.users AND users table
};
```
**What it does:** Creates new user account in Supabase with profile data

---

### 3. Dashboard Page (`/src/app/pages/Dashboard.tsx`)
**Supabase Code:**
```typescript
import { useAuth } from '../../contexts/AuthContext';

const { user } = useAuth();

// Shows personalized greeting
<h1>Welcome, {user?.full_name}</h1>

// Role-based navigation
{user?.role === 'customer' && <CustomerView />}
{user?.role === 'staff' && <StaffView />}
```
**What it does:** Displays user-specific content based on their role from database

---

### 4. Services Page (`/src/app/pages/Services.tsx`)  
**Supabase Code:**
```typescript
import { useAuth } from '../../contexts/AuthContext';
import {
  createQueueTicket,
  getActiveTicket
} from '../../services/queueService';

const { user } = useAuth();

// Check for active ticket
useEffect(() => {
  const checkActiveTicket = async () => {
    const { data } = await getActiveTicket(user.id);
    setHasActiveTicket(!!data);
  };
  checkActiveTicket();
}, [user]);

// Join queue
const handleJoinQueue = async () => {
  const { data, error } = await createQueueTicket(
    user.id,
    industry.id,
    selectedService.id
  );
  // Creates ticket in database with auto-generated number
  setQueueTicket(data);
};
```
**What it does:** 
- Creates real queue tickets in Supabase
- Auto-generates ticket numbers
- Calculates queue position and wait time
- Checks for existing active tickets

---

### 5. Queue Status Page (`/src/app/pages/QueueStatusNew.tsx`)
**Supabase Code:**
```typescript
import { useAuth } from '../../contexts/AuthContext';
import {
  getActiveTicket,
  getCustomerTickets,
  cancelTicket,
  subscribeToTicketUpdates
} from '../../services/queueService';

const { user } = useAuth();

// Load tickets from database
useEffect(() => {
  const loadTickets = async () => {
    const [activeResult, allResult] = await Promise.all([
      getActiveTicket(user.id),
      getCustomerTickets(user.id)
    ]);
    setActiveTicket(activeResult.data);
    setAllTickets(allResult.data);
  };
  loadTickets();
}, [user]);

// Real-time updates
useEffect(() => {
  if (!activeTicket) return;
  
  const subscription = subscribeToTicketUpdates(
    activeTicket.id,
    (payload) => {
      setActiveTicket(payload.new as QueueTicket);
      
      if (payload.new.status === 'called') {
        showNotification('Your turn is up!');
      }
    }
  );
  
  return () => subscription.unsubscribe();
}, [activeTicket?.id]);

// Cancel ticket
const handleCancelTicket = async () => {
  const { error } = await cancelTicket(activeTicket.id);
  // Updates database
};
```
**What it does:**
- Shows active ticket from database
- Real-time updates when ticket status changes
- Cancel tickets in database
- View ticket history

---

### 6. Appointments Page (`/src/app/pages/Appointments.tsx`)
**Supabase Code:**
```typescript
import { useAuth } from '../../contexts/AuthContext';
import {
  createAppointment,
  getCustomerAppointments,
  updateAppointmentStatus,
  cancelAppointment as cancelSupabaseAppointment,
  getServicesByIndustry
} from '../../services/queueService';

const { user } = useAuth();

// Load services from database
useEffect(() => {
  const loadServices = async () => {
    const { data } = await getServicesByIndustry(industry.id);
    if (data) setServices(data);
  };
  loadServices();
}, [industry]);

// Load appointments from database
useEffect(() => {
  const loadAppointments = async () => {
    const { data } = await getCustomerAppointments(user.id);
    if (data) setAppointments(data);
  };
  loadAppointments();
}, [user]);

// Book appointment
const handleBookAppointment = async (e: React.FormEvent) => {
  const selectedService = services.find(s => s.name === formData.service);
  
  const { data, error } = await createAppointment(
    user.id,
    industry.id,
    selectedService.id,
    formData.date,
    formData.time,
    formData.notes
  );
  // Creates appointment in database
};

// Cancel appointment
const cancelAppointment = async (id: string) => {
  const { error } = await cancelSupabaseAppointment(id);
  // Updates status to 'cancelled' in database
};
```
**What it does:**
- Fetches services from database (not hardcoded)
- Books appointments in Supabase
- Shows user's appointments from database
- Cancel/confirm appointments with real database updates

---

## Core Backend Files

### `/src/lib/supabase.ts`
```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(supabaseUrl, supabasePublishableKey);

// All TypeScript interfaces:
export interface User { ... }
export interface QueueTicket { ... }
export interface Appointment { ... }
export interface Service { ... }
export interface Counter { ... }
```

### `/src/contexts/AuthContext.tsx`
```typescript
export function AuthProvider({ children }) {
  const [user, setUser] = useState<User | null>(null);
  
  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email, password
    });
    // Load user profile from users table
  };
  
  const signUp = async (email, password, fullName, role) => {
    // Create auth user
    const { data: authData } = await supabase.auth.signUp({ email, password });
    
    // Create user profile
    await supabase.from('users').insert({
      id: authData.user.id,
      email,
      full_name: fullName,
      role
    });
  };
  
  const signOut = async () => {
    await supabase.auth.signOut();
  };
}
```

### `/src/services/queueService.ts`
```typescript
// Create queue ticket
export const createQueueTicket = async (customerId, industryId, serviceId) => {
  const { data, error } = await supabase
    .from('queue_tickets')
    .insert({ customer_id: customerId, industry_id: industryId, service_id: serviceId })
    .select()
    .single();
  return { data, error };
};

// Get active ticket
export const getActiveTicket = async (customerId) => {
  const { data, error } = await supabase
    .from('queue_tickets')
    .select('*, industry:industries(*), service:services(*)')
    .eq('customer_id', customerId)
    .in('status', ['waiting', 'called', 'serving'])
    .single();
  return { data, error };
};

// Real-time subscriptions
export const subscribeToTicketUpdates = (ticketId, callback) => {
  return supabase
    .channel(`ticket_${ticketId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'queue_tickets',
      filter: `id=eq.${ticketId}`
    }, callback)
    .subscribe();
};

// ... +20 more functions for appointments, services, counters, etc.
```

---

## How Data Flows

### Customer Joins Queue:
1. User clicks "Join Virtual Queue" in `/src/app/pages/Services.tsx`
2. Calls `createQueueTicket()` from `queueService.ts`
3. Supabase creates row in `queue_tickets` table
4. Database trigger auto-generates ticket number (e.g., "T20260423-0001")
5. Returns ticket with position and wait time
6. User sees QR code and ticket details

### Real-Time Updates:
1. Staff calls next customer via admin panel
2. Database updates ticket status to 'called'
3. Realtime subscription in `QueueStatusNew.tsx` receives event
4. Customer's screen updates automatically
5. Browser notification shows "Your turn is up!"

### Authentication Flow:
1. User enters email/password in Login page
2. `signIn()` calls `supabase.auth.signInWithPassword()`
3. Supabase validates credentials
4. If valid, loads user profile from `users` table
5. AuthContext stores user data globally
6. All pages access user via `useAuth()` hook

---

## Database Tables Being Used

- ✅ `auth.users` - Supabase authentication
- ✅ `users` - User profiles with roles
- ✅ `industries` - Banking, Healthcare, etc.
- ✅ `services` - Services per industry
- ✅ `queue_tickets` - Active queue tickets
- ✅ `appointments` - Scheduled appointments
- ⏳ `counters` - Staff counters (created but not used yet)
- ⏳ `businesses` - Business entities (created but not used yet)

---

## Pages Still Using Mock Data ❌

These pages need integration:
- `/src/app/pages/StaffPortal.tsx` - Staff counter management
- `/src/app/pages/AdminDashboard.tsx` - Admin panel
- `/src/app/pages/EmployeeManagement.tsx` - User management
- `/src/app/pages/Analytics.tsx` - Reports
- `/src/app/pages/BusinessRequests.tsx` - Business approvals

---

## Testing the Integration

### 1. Sign Up:
```
Go to /signup
Email: test@example.com
Password: password123
```
→ Creates user in Supabase

### 2. Join Queue:
```
Select industry → Select service → Choose branch → Click "Join Queue"
```
→ Creates ticket in database with auto-generated number

### 3. View Status:
```
Go to /status
```
→ Shows your active ticket from database

### 4. Book Appointment:
```
Go to /appointments → Click "Book Appointment"
```
→ Creates appointment in database

### 5. Real-Time:
```
Open two browsers
Join queue in one
Watch it appear in staff dashboard (when implemented)
```

---

## Key Differences from Mock Data

| Feature | Mock Data (Before) | Supabase (Now) |
|---------|-------------------|----------------|
| Ticket Numbers | Random (e.g., 345) | Auto-generated (T20260423-0001) |
| Queue Position | Random | Calculated from actual queue |
| Wait Time | Random | Based on service duration × position |
| Data Persistence | localStorage | PostgreSQL database |
| Real-time Updates | Manual refresh | Automatic via subscriptions |
| Multi-user | No | Yes, shared database |
| Authentication | Fake (any email) | Real (Supabase Auth) |

---

**Your SQMS now uses real Supabase backend for core customer features!** 🎉

Check these files to see the actual integration code:
- `/src/app/pages/Services.tsx` - Lines 1-30, 80-110
- `/src/app/pages/QueueStatusNew.tsx` - Lines 1-50, 70-120
- `/src/app/pages/Appointments.tsx` - Lines 1-40, 95-145
- `/src/contexts/AuthContext.tsx` - Entire file
- `/src/services/queueService.ts` - Entire file
