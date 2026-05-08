# ⚡ Real-Time Implementation Guide

This guide shows you how to enable and use real-time updates across your entire SQMS application.

---

## 🚀 Step 1: Enable Real-Time in Supabase

### Option A: Fresh Setup
Run `COMPLETE_SUPABASE_SETUP.sql` - **real-time is already included!**

### Option B: Update Existing Database
1. Go to Supabase → **SQL Editor**
2. Run `supabase/migrations/005_enable_realtime.sql`
3. ✅ All tables now support real-time!

### Verify Real-Time is Active

**In SQL Editor:**
```sql
SELECT tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

**Expected result:**
```
tablename
---------------
users
services
businesses
counters
queue_tickets
appointments
```

**In Supabase Dashboard:**
- Go to **Database** → **Replication**
- You should see all 6 tables listed as "enabled"

---

## 📋 What Real-Time Enables

### 1️⃣ **Queue Tickets** (Most Important!)
✅ Staff see new customers joining the queue **instantly**
✅ Customers see their position update in **real-time**
✅ Ticket status changes broadcast to all users

### 2️⃣ **Appointments**
✅ New bookings appear instantly
✅ Cancellations update immediately
✅ Staff see schedule changes live

### 3️⃣ **Counters**
✅ Counter status changes (active → on_break) update live
✅ Staff assignments show immediately
✅ Queue display updates when counters change

### 4️⃣ **Users**
✅ New staff members appear in employee list instantly
✅ Role changes take effect immediately

### 5️⃣ **Services**
✅ Service additions/changes show up instantly
✅ Service activation/deactivation updates live

### 6️⃣ **Businesses**
✅ Business approvals update immediately
✅ New business registrations appear live

---

## 💻 Step 2: Use Real-Time Hooks in Your App

I've created ready-to-use React hooks in `/src/hooks/`:

### Hook 1: `useRealtimeQueue`

**Use Case:** Staff dashboard showing live queue

```tsx
import { useRealtimeQueue } from '../hooks/useRealtimeQueue';

function StaffDashboard() {
  const { tickets, loading } = useRealtimeQueue('banking');

  if (loading) return <div>Loading queue...</div>;

  return (
    <div>
      <h2>Live Queue ({tickets.length} waiting)</h2>
      {tickets.map(ticket => (
        <div key={ticket.id}>
          {ticket.ticket_number} - {ticket.status}
        </div>
      ))}
    </div>
  );
}
```

**What happens:**
- Initial load fetches all tickets
- New customers joining queue appear **instantly**
- Status changes (waiting → called → serving) update **live**
- Completed/cancelled tickets disappear automatically

---

### Hook 2: `useRealtimeTicket`

**Use Case:** Customer watching their specific ticket

```tsx
import { useRealtimeTicket } from '../hooks/useRealtimeQueue';

function QueueStatus({ ticketId }) {
  const { ticket, loading } = useRealtimeTicket(ticketId);

  if (loading) return <div>Loading ticket...</div>;
  if (!ticket) return <div>Ticket not found</div>;

  return (
    <div>
      <h1>{ticket.ticket_number}</h1>
      <p>Status: {ticket.status}</p>
      <p>Position: {ticket.position}</p>
      <p>Estimated wait: {ticket.estimated_wait_time} min</p>
    </div>
  );
}
```

**What happens:**
- Customer sees their ticket number
- Position updates **automatically** as queue moves
- Status changes when staff calls them
- No need to refresh!

---

### Hook 3: `useRealtimeCounters`

**Use Case:** Display live counter status

```tsx
import { useRealtimeCounters } from '../hooks/useRealtimeCounters';

function CounterStatus() {
  const { counters, loading } = useRealtimeCounters('banking');

  return (
    <div>
      {counters.map(counter => (
        <div key={counter.id}>
          {counter.name}: 
          <span className={counter.status === 'active' ? 'green' : 'red'}>
            {counter.status}
          </span>
        </div>
      ))}
    </div>
  );
}
```

**What happens:**
- Counter status changes appear instantly
- When staff goes on break, badge turns red
- When counter reopens, badge turns green

---

### Hook 4: `useRealtimeSubscription` (Generic)

**Use Case:** Subscribe to any table

```tsx
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';
import type { Appointment } from '../lib/supabase';

function AppointmentsList() {
  const { data: appointments, loading } = useRealtimeSubscription<Appointment>(
    'appointments',
    '*',
    'industry_id=eq.healthcare'
  );

  return (
    <div>
      <h2>Today's Appointments</h2>
      {appointments.map(apt => (
        <div key={apt.id}>
          {apt.appointment_time} - {apt.status}
        </div>
      ))}
    </div>
  );
}
```

---

## 🎯 Step 3: Implement in Key Pages

### Staff Dashboard (Priority #1)

**File:** `/src/app/pages/StaffDashboard.tsx`

```tsx
import { useRealtimeQueue } from '../hooks/useRealtimeQueue';
import { useRealtimeCounters } from '../hooks/useRealtimeCounters';

export function StaffDashboard() {
  const staffIndustry = localStorage.getItem('sqms_staff_industry');
  
  // 🔥 Real-time queue updates
  const { tickets, loading: queueLoading } = useRealtimeQueue(staffIndustry || undefined);
  
  // 🔥 Real-time counter status
  const { counters } = useRealtimeCounters(staffIndustry || undefined);

  const waitingTickets = tickets.filter(t => t.status === 'waiting');

  return (
    <div>
      <h1>Staff Dashboard - Live Queue</h1>
      
      <div className="counters">
        {counters.map(counter => (
          <div key={counter.id}>
            {counter.name}: {counter.status}
          </div>
        ))}
      </div>

      <div className="queue">
        <h2>Waiting ({waitingTickets.length})</h2>
        {waitingTickets.map(ticket => (
          <div key={ticket.id} className="ticket-card">
            <span>{ticket.ticket_number}</span>
            <span>Position: {ticket.position}</span>
            <button onClick={() => callNext(ticket)}>Call</button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### Customer Queue Status (Priority #2)

**File:** `/src/app/pages/QueueStatusNew.tsx`

```tsx
import { useRealtimeTicket } from '../hooks/useRealtimeTicket';

export function QueueStatusNew() {
  const activeTicketId = localStorage.getItem('sqms_active_ticket_id');
  
  // 🔥 Real-time ticket updates
  const { ticket, loading } = useRealtimeTicket(activeTicketId);

  if (loading) return <div>Loading your ticket...</div>;
  if (!ticket) return <div>No active ticket</div>;

  return (
    <div className="queue-status">
      {/* Ticket number - updates live */}
      <div className="ticket-display">
        <h1>{ticket.ticket_number}</h1>
        <p className="status">{ticket.status}</p>
      </div>

      {/* Position - updates automatically */}
      <div className="position">
        <h2>Your Position</h2>
        <div className="position-number">{ticket.position}</div>
      </div>

      {/* Wait time - updates in real-time */}
      <div className="wait-time">
        <p>Estimated wait: {ticket.estimated_wait_time} minutes</p>
      </div>

      {/* Status changes automatically */}
      {ticket.status === 'called' && (
        <div className="alert">
          🔔 Your turn! Please proceed to the counter.
        </div>
      )}
    </div>
  );
}
```

---

### Admin Dashboard (Priority #3)

```tsx
import { useRealtimeSubscription } from '../hooks/useRealtimeSubscription';

export function AdminDashboard() {
  const { data: todayTickets } = useRealtimeSubscription(
    'queue_tickets',
    '*',
    `created_at=gte.${new Date().toISOString().split('T')[0]}`
  );

  const { data: staff } = useRealtimeSubscription(
    'users',
    '*',
    'role=eq.staff'
  );

  return (
    <div>
      <h1>Admin Dashboard - Live Stats</h1>
      
      <div className="stats">
        <div>Total Tickets Today: {todayTickets.length}</div>
        <div>Active Staff: {staff.length}</div>
      </div>
    </div>
  );
}
```

---

## 🎨 Step 4: Add Visual Feedback

### Show "Live" Indicator

```tsx
function LiveIndicator() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      <span className="text-sm text-slate-600">Live</span>
    </div>
  );
}
```

### Add to your dashboard header:

```tsx
<div className="header">
  <h1>Staff Dashboard</h1>
  <LiveIndicator />
</div>
```

---

## 🔔 Step 5: Add Notifications (Optional)

### Notify when ticket is called

```tsx
import { useEffect } from 'react';
import { useRealtimeTicket } from '../hooks/useRealtimeTicket';

function QueueStatus({ ticketId }) {
  const { ticket } = useRealtimeTicket(ticketId);
  const prevStatus = useRef(ticket?.status);

  useEffect(() => {
    if (ticket && prevStatus.current !== 'called' && ticket.status === 'called') {
      // Show notification
      if ('Notification' in window) {
        new Notification('Your turn!', {
          body: `Ticket ${ticket.ticket_number} - Please proceed to the counter`,
          icon: '/logo.png'
        });
      }

      // Play sound
      const audio = new Audio('/notification.mp3');
      audio.play();
    }
    prevStatus.current = ticket?.status;
  }, [ticket?.status]);

  return <div>...</div>;
}
```

---

## 🧪 Step 6: Test Real-Time

### Test 1: Queue Updates

1. **Open 2 browser windows:**
   - Window 1: Staff dashboard
   - Window 2: Customer page

2. **Customer joins queue** (Window 2)
   - Click "Join Queue"

3. **Check staff dashboard** (Window 1)
   - ✅ New ticket should appear **instantly** without refresh!

---

### Test 2: Ticket Status Updates

1. **Open 2 windows:**
   - Window 1: Customer queue status page
   - Window 2: Staff dashboard

2. **Staff calls customer** (Window 2)
   - Click "Call Next"

3. **Check customer page** (Window 1)
   - ✅ Status changes to "Called" **instantly**!
   - ✅ Alert appears automatically!

---

### Test 3: Counter Status

1. **Open admin dashboard**

2. **In Supabase**, update a counter status:
```sql
UPDATE counters 
SET status = 'on_break' 
WHERE name = 'Counter 1';
```

3. **Check dashboard**
   - ✅ Counter status updates **immediately**!

---

## 📊 Performance Notes

### Connection Limits
- Each user opens 1 WebSocket connection
- Supabase handles reconnection automatically
- Subscriptions are cleaned up on unmount

### Optimization Tips

**1. Filter subscriptions:**
```tsx
// ❌ Bad: Subscribe to all tickets globally
useRealtimeQueue();

// ✅ Good: Subscribe only to your industry
useRealtimeQueue('banking');
```

**2. Unsubscribe when not needed:**
```tsx
// Automatically handled by hooks!
// Cleanup happens on component unmount
```

**3. Debounce rapid updates:**
```tsx
const [tickets, setTickets] = useState([]);
const debouncedTickets = useDebounce(tickets, 300);
```

---

## 🚨 Troubleshooting

### Real-time not working?

**1. Check Supabase Dashboard:**
```
Database → Replication
→ Make sure tables are enabled
```

**2. Check browser console:**
```javascript
// Should see: "Realtime connection established"
// Should see: "Real-time INSERT on queue_tickets: ..."
```

**3. Verify RLS policies:**
```sql
-- Users must have SELECT permission
SELECT * FROM queue_tickets WHERE industry_id = 'banking';
```

**4. Check network:**
- Real-time uses WebSocket (wss://)
- Make sure firewall/proxy allows WebSocket

---

### Updates delayed?

- Check your internet connection
- Supabase may throttle on free tier
- Try refreshing the page

---

### Memory leaks?

Make sure you're using the hooks correctly:
```tsx
// ✅ Good: Hook manages cleanup
const { tickets } = useRealtimeQueue('banking');

// ❌ Bad: Manual subscription without cleanup
useEffect(() => {
  const channel = supabase.channel('...');
  // Missing cleanup!
}, []);
```

---

## ✅ Final Checklist

- [ ] Run realtime migration SQL
- [ ] Verify tables in Database → Replication
- [ ] Add hooks to StaffDashboard
- [ ] Add hooks to QueueStatus
- [ ] Add "Live" indicator badge
- [ ] Test with 2 browser windows
- [ ] Verify updates appear instantly
- [ ] Check browser console for errors

---

**Your app is now fully real-time! 🎉**

Changes to queue tickets, appointments, counters, and more will appear **instantly** across all connected users!
