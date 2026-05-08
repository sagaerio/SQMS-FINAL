# ⚡ Add Real-Time Queue to Staff Dashboard

Quick guide to replace demo data with **live real-time queue** in the staff dashboard.

---

## 🎯 What You'll Get

**Before (Demo Data):**
- Static list of fake customers
- No updates without refresh
- Data resets on page reload

**After (Real-Time):**
- Live queue updates **instantly**
- See customers join in real-time
- Auto-updates when tickets change status
- No refresh needed!

---

## 🚀 Step-by-Step Implementation

### Step 1: Import the Hook

Add to top of `/src/app/pages/StaffDashboard.tsx`:

```tsx
import { useRealtimeQueue } from '../hooks/useRealtimeQueue';
```

### Step 2: Use the Hook

Replace the demo queue state with real-time data:

```tsx
export function StaffDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // Get staff's industry
  const staffIndustry = localStorage.getItem('sqms_staff_industry');
  
  // 🔥 REAL-TIME QUEUE - Replace demo data
  const { tickets, loading: queueLoading } = useRealtimeQueue(staffIndustry || undefined);
  
  // Calculate from real data
  const waitingQueue = tickets.filter(t => t.status === 'waiting');
  const currentlyServing = tickets.find(t => t.status === 'serving') || null;
  const completedToday = tickets.filter(t => 
    t.status === 'completed' && 
    new Date(t.created_at).toDateString() === new Date().toDateString()
  ).length;
  
  // ... rest of component
}
```

### Step 3: Update the Queue Display

Replace the demo queue mapping with real tickets:

```tsx
{/* Waiting Queue */}
<div className="space-y-3">
  {waitingQueue.length === 0 ? (
    <div className="text-center py-8 text-slate-500">
      No customers waiting
    </div>
  ) : (
    waitingQueue.map((ticket) => (
      <div 
        key={ticket.id} 
        className="bg-white p-4 rounded-xl border-2 border-slate-200 hover:border-blue-300 transition-all cursor-pointer"
        onClick={() => setSelectedCustomer(ticket)}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg font-bold">
              {ticket.ticket_number}
            </div>
            <div>
              <p className="font-semibold text-slate-800">Position: {ticket.position}</p>
              <p className="text-sm text-slate-600">
                {new Date(ticket.created_at).toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              callNextCustomer(ticket);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Call
          </button>
        </div>
      </div>
    ))
  )}
</div>
```

### Step 4: Update Stats Display

Show real-time statistics:

```tsx
{/* Statistics Cards */}
<div className="grid grid-cols-3 gap-4 mb-6">
  {/* Waiting */}
  <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-6 text-white">
    <div className="flex items-center justify-between mb-2">
      <Clock className="w-8 h-8 opacity-80" />
    </div>
    <div className="text-3xl font-bold mb-1">{waitingQueue.length}</div>
    <div className="text-sm opacity-90">Waiting in Queue</div>
  </div>

  {/* Currently Serving */}
  <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
    <div className="flex items-center justify-between mb-2">
      <UserPlus className="w-8 h-8 opacity-80" />
    </div>
    <div className="text-3xl font-bold mb-1">
      {currentlyServing ? '1' : '0'}
    </div>
    <div className="text-sm opacity-90">Currently Serving</div>
  </div>

  {/* Completed Today */}
  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
    <div className="flex items-center justify-between mb-2">
      <CheckCircle className="w-8 h-8 opacity-80" />
    </div>
    <div className="text-3xl font-bold mb-1">{completedToday}</div>
    <div className="text-sm opacity-90">Completed Today</div>
  </div>
</div>
```

### Step 5: Add Call Next Function

Handle calling the next customer:

```tsx
const callNextCustomer = async (ticket: any) => {
  try {
    // Update ticket status to 'called'
    const { error } = await supabase
      .from('queue_tickets')
      .update({ 
        status: 'called',
        called_at: new Date().toISOString()
      })
      .eq('id', ticket.id);

    if (error) throw error;

    // Ticket will auto-update via real-time subscription!
    console.log('Customer called:', ticket.ticket_number);
  } catch (err) {
    console.error('Error calling customer:', err);
    alert('Failed to call customer');
  }
};
```

### Step 6: Add "Live" Indicator

Show that data is real-time:

```tsx
<div className="flex items-center justify-between mb-6">
  <div>
    <h1 className="text-3xl font-bold text-slate-800">Staff Dashboard</h1>
    <p className="text-slate-600">Counter {assignedCounter}</p>
  </div>
  
  {/* Live Indicator */}
  <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full border border-green-200">
    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
    <span className="text-sm font-semibold text-green-700">LIVE</span>
  </div>
</div>
```

---

## 🧪 Test Real-Time

### Test 1: See New Customers Instantly

1. **Open 2 browser windows:**
   - Window 1: Staff dashboard (your account)
   - Window 2: Customer account

2. **Window 2:** Join the queue
   - Select same industry as your staff account
   - Choose a service
   - Click "Join Queue"

3. **Watch Window 1:** 
   - ✅ New ticket appears **instantly**!
   - ✅ Queue count updates automatically
   - ✅ No refresh needed!

---

### Test 2: Status Updates

1. **Window 1 (Staff):** Click "Call" on a ticket

2. **Check Supabase:**
   - Table Editor → queue_tickets
   - ✅ Status changed to "called"

3. **Window 1 (Staff):**
   - ✅ Ticket moved to "Currently Serving"
   - ✅ UI updated automatically!

---

### Test 3: Completed Tickets

1. **Mark ticket as completed:**
```tsx
const completeService = async (ticketId: string) => {
  const { error } = await supabase
    .from('queue_tickets')
    .update({ 
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('id', ticketId);

  if (error) console.error(error);
  // Auto-updates via real-time!
};
```

2. ✅ "Completed Today" counter increases automatically

---

## 🎨 Optional Enhancements

### Add Sound Notification

When new customer joins:

```tsx
import { useEffect, useRef } from 'react';

const prevCountRef = useRef(waitingQueue.length);

useEffect(() => {
  if (waitingQueue.length > prevCountRef.current) {
    // Play notification sound
    const audio = new Audio('/notification.mp3');
    audio.play().catch(e => console.log('Audio play failed:', e));
    
    // Show toast
    alert('New customer joined the queue!');
  }
  prevCountRef.current = waitingQueue.length;
}, [waitingQueue.length]);
```

### Add Auto-Refresh Counter

Show when data was last updated:

```tsx
const [lastUpdate, setLastUpdate] = useState(new Date());

useEffect(() => {
  setLastUpdate(new Date());
}, [tickets]);

return (
  <div className="text-xs text-slate-500">
    Last update: {lastUpdate.toLocaleTimeString()}
  </div>
);
```

### Add Loading State

While initial data loads:

```tsx
if (queueLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
        <p>Loading live queue...</p>
      </div>
    </div>
  );
}
```

---

## 📊 Complete Example

Here's what the full component looks like with real-time:

```tsx
import { useRealtimeQueue } from '../hooks/useRealtimeQueue';
import { supabase } from '../../lib/supabase';

export function StaffDashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const staffIndustry = localStorage.getItem('sqms_staff_industry');
  
  // 🔥 Real-time queue
  const { tickets, loading: queueLoading } = useRealtimeQueue(staffIndustry || undefined);
  
  // Derived state from real data
  const waitingQueue = tickets.filter(t => t.status === 'waiting');
  const currentlyServing = tickets.find(t => t.status === 'serving');
  const completedToday = tickets.filter(t => 
    t.status === 'completed' && 
    new Date(t.created_at).toDateString() === new Date().toDateString()
  ).length;

  const callNextCustomer = async (ticket: any) => {
    const { error } = await supabase
      .from('queue_tickets')
      .update({ status: 'called', called_at: new Date().toISOString() })
      .eq('id', ticket.id);
    
    if (error) console.error('Error calling customer:', error);
  };

  if (authLoading || queueLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6">
      {/* Header with Live indicator */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Staff Dashboard</h1>
        <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-semibold text-green-700">LIVE</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-orange-500 text-white p-6 rounded-2xl">
          <div className="text-3xl font-bold">{waitingQueue.length}</div>
          <div className="text-sm">Waiting</div>
        </div>
        <div className="bg-green-500 text-white p-6 rounded-2xl">
          <div className="text-3xl font-bold">{currentlyServing ? 1 : 0}</div>
          <div className="text-sm">Serving</div>
        </div>
        <div className="bg-blue-500 text-white p-6 rounded-2xl">
          <div className="text-3xl font-bold">{completedToday}</div>
          <div className="text-sm">Completed Today</div>
        </div>
      </div>

      {/* Queue List */}
      <div className="bg-white rounded-2xl p-6">
        <h2 className="text-xl font-bold mb-4">Waiting Queue</h2>
        {waitingQueue.map(ticket => (
          <div key={ticket.id} className="flex justify-between items-center p-4 border-b">
            <div>
              <span className="font-bold">{ticket.ticket_number}</span>
              <span className="ml-4 text-slate-600">Position: {ticket.position}</span>
            </div>
            <button
              onClick={() => callNextCustomer(ticket)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Call
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## ✅ Checklist

- [ ] Import `useRealtimeQueue` hook
- [ ] Replace demo queue state with real-time hook
- [ ] Update queue display to use real tickets
- [ ] Add "Call Next" function with Supabase update
- [ ] Add "Live" indicator badge
- [ ] Test with 2 browser windows
- [ ] Verify updates appear instantly

---

**Your staff dashboard is now fully real-time! 🎉**

Changes to the queue appear **instantly** across all connected staff members!
