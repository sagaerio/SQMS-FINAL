# ⚡ Enable Real-Time NOW (5 Minutes)

Quick guide to enable real-time updates across your entire SQMS app.

---

## 🚀 Step 1: Enable in Supabase (2 minutes)

### Option A: Fresh Setup
If you haven't set up your database yet:
1. Run `COMPLETE_SUPABASE_SETUP.sql` in SQL Editor
2. ✅ Done! Real-time is included.

### Option B: Update Existing Database
If you already ran the setup:
1. Go to Supabase → **SQL Editor**
2. Copy contents of `supabase/migrations/005_enable_realtime.sql`
3. Paste and click **Run**
4. ✅ Done!

---

## ✅ Step 2: Verify It's Enabled (30 seconds)

Run this in SQL Editor:
```sql
SELECT tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

**You should see:**
```
users
services  
businesses
counters
queue_tickets
appointments
```

**Or check Dashboard:**
- Go to **Database** → **Replication**
- All 6 tables should show "enabled" ✅

---

## 💻 Step 3: Use in Your App (2 minutes)

### Quick Win #1: Live Queue for Staff

Edit `/src/app/pages/StaffDashboard.tsx`:

```tsx
import { useRealtimeQueue } from '../hooks/useRealtimeQueue';

export function StaffDashboard() {
  const staffIndustry = localStorage.getItem('sqms_staff_industry');
  
  // 🔥 This line enables real-time!
  const { tickets, loading } = useRealtimeQueue(staffIndustry || undefined);

  const waitingTickets = tickets.filter(t => t.status === 'waiting');

  // ... rest of your component
  // tickets will update automatically!
}
```

### Quick Win #2: Live Ticket for Customers

Edit `/src/app/pages/QueueStatusNew.tsx`:

```tsx
import { useRealtimeTicket } from '../hooks/useRealtimeQueue';

export function QueueStatusNew() {
  const activeTicketId = localStorage.getItem('sqms_active_ticket_id');
  
  // 🔥 This line enables real-time!
  const { ticket, loading } = useRealtimeTicket(activeTicketId);

  // ticket.position, ticket.status update automatically!
  // No refresh needed!
}
```

---

## 🧪 Step 4: Test It (1 minute)

1. **Open 2 browser windows**
2. **Window 1:** Login as staff → Go to staff dashboard
3. **Window 2:** Login as customer → Join queue
4. **Watch Window 1:** New ticket appears **instantly**! ✨

---

## 🎯 What's Now Real-Time?

✅ **Queue Tickets** - New customers appear instantly  
✅ **Ticket Status** - Called/Serving updates live  
✅ **Appointments** - New bookings show immediately  
✅ **Counters** - Status changes (active/on_break) update live  
✅ **Users** - New staff appear instantly  
✅ **Services** - Service changes update immediately  

---

## 📁 Files You Have

**Hooks (Ready to use):**
- `/src/hooks/useRealtimeQueue.ts` - For queue tickets
- `/src/hooks/useRealtimeTicket.ts` - For single ticket
- `/src/hooks/useRealtimeCounters.ts` - For counters
- `/src/hooks/useRealtimeSubscription.ts` - Generic for any table

**Guides:**
- `REALTIME_IMPLEMENTATION_GUIDE.md` - Complete guide with examples
- `ENABLE_REALTIME_NOW.md` - This quick start (you are here!)

**SQL:**
- `supabase/migrations/005_enable_realtime.sql` - Enable realtime
- `COMPLETE_SUPABASE_SETUP.sql` - Includes realtime by default

---

## 🚨 Troubleshooting

### Not seeing updates?

**1. Check SQL was run:**
```sql
SELECT tablename FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

**2. Check browser console:**
- Should see: `"Real-time INSERT on queue_tickets:"`
- If not, refresh the page

**3. Check RLS policies:**
- Users must have SELECT permission on tables
- Already configured in COMPLETE_SUPABASE_SETUP.sql

### Still not working?

1. Refresh your browser (Ctrl+Shift+R)
2. Check Network tab - look for WebSocket connection (wss://)
3. Try in incognito window
4. Check Supabase Dashboard → Database → Replication

---

## 💡 Quick Examples

### Show "Live" indicator on your page:

```tsx
function LiveBadge() {
  return (
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      <span className="text-xs text-slate-600">LIVE</span>
    </div>
  );
}

// Add to your header:
<h1>Staff Dashboard <LiveBadge /></h1>
```

### Toast notification when ticket is called:

```tsx
import { useEffect, useRef } from 'react';

const { ticket } = useRealtimeTicket(ticketId);
const prevStatus = useRef(ticket?.status);

useEffect(() => {
  if (prevStatus.current !== 'called' && ticket?.status === 'called') {
    alert('🔔 Your turn! Please proceed to the counter.');
  }
  prevStatus.current = ticket?.status;
}, [ticket?.status]);
```

---

## ✅ 5-Minute Checklist

- [ ] Run SQL in Supabase (2 min)
- [ ] Verify tables enabled (30 sec)
- [ ] Add hook to StaffDashboard (1 min)
- [ ] Add hook to QueueStatus (1 min)
- [ ] Test with 2 windows (30 sec)

---

**Done! Your app is now fully real-time! 🎉**

No more refreshing. No more polling. Everything updates **instantly**.

For more details, see `REALTIME_IMPLEMENTATION_GUIDE.md`
