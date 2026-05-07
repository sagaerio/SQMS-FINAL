# Supabase Integration Examples

Quick reference for integrating Supabase into your remaining pages.

## Import Statements

```typescript
// Authentication
import { useAuth } from '../contexts/AuthContext';

// Queue Services
import {
  createQueueTicket,
  getActiveTicket,
  getCustomerTickets,
  cancelTicket,
  updateTicketStatus,
  getQueueByIndustry,
  subscribeToQueueUpdates,
  subscribeToTicketUpdates
} from '../services/queueService';

// Appointment Services
import {
  createAppointment,
  getCustomerAppointments,
  updateAppointmentStatus,
  cancelAppointment
} from '../services/queueService';

// Service & Counter Management
import {
  getServicesByIndustry,
  getAllServices,
  getCountersByIndustry,
  updateCounterStatus,
  assignTicketToCounter
} from '../services/queueService';

// Types
import type { QueueTicket, Appointment, Service, Counter } from '../lib/supabase';
```

## Authentication Examples

### Get Current User
```typescript
const { user, loading } = useAuth();

// Redirect if not authenticated
useEffect(() => {
  if (!loading && !user) {
    navigate('/login');
  }
}, [user, loading, navigate]);

// Use user data
console.log(user?.full_name);
console.log(user?.role); // 'customer', 'staff', 'admin', 'superadmin'
console.log(user?.email);
```

### Sign Out
```typescript
const { signOut } = useAuth();

const handleLogout = async () => {
  await signOut();
  navigate('/login');
};
```

## Queue Management Examples

### Create a Queue Ticket
```typescript
const handleJoinQueue = async () => {
  if (!user || !selectedService) return;

  const { data, error } = await createQueueTicket(
    user.id,
    'banking', // industry_id
    selectedService.id
  );

  if (error) {
    alert('Failed to join queue');
    return;
  }

  console.log('Ticket created:', data.ticket_number);
  console.log('Position:', data.position);
  console.log('Wait time:', data.estimated_wait_time);
};
```

### Get Active Ticket
```typescript
useEffect(() => {
  if (!user) return;

  const loadActiveTicket = async () => {
    const { data, error } = await getActiveTicket(user.id);
    
    if (data) {
      setActiveTicket(data);
    }
  };

  loadActiveTicket();
}, [user]);
```

### Real-Time Ticket Updates
```typescript
useEffect(() => {
  if (!activeTicket) return;

  const subscription = subscribeToTicketUpdates(
    activeTicket.id,
    (payload) => {
      console.log('Ticket updated:', payload);
      
      if (payload.eventType === 'UPDATE') {
        setActiveTicket(payload.new as QueueTicket);
        
        if (payload.new.status === 'called') {
          alert('Your turn! Please proceed to your counter.');
        }
      }
    }
  );

  return () => subscription.unsubscribe();
}, [activeTicket?.id]);
```

### Cancel Ticket
```typescript
const handleCancel = async (ticketId: string) => {
  const confirmed = window.confirm('Cancel this ticket?');
  if (!confirmed) return;

  const { error } = await cancelTicket(ticketId);
  
  if (error) {
    alert('Failed to cancel');
    return;
  }

  alert('Ticket cancelled successfully');
};
```

## Appointment Examples

### Create Appointment
```typescript
const handleBookAppointment = async () => {
  if (!user || !selectedService) return;

  const { data, error } = await createAppointment(
    user.id,
    'banking', // industry_id
    selectedService.id,
    '2026-04-25', // date
    '10:00', // time
    'Need to discuss loan options' // notes (optional)
  );

  if (error) {
    alert('Failed to book appointment');
    return;
  }

  alert('Appointment booked!');
};
```

### Get Customer Appointments
```typescript
useEffect(() => {
  if (!user) return;

  const loadAppointments = async () => {
    const { data, error } = await getCustomerAppointments(user.id);
    
    if (data) {
      setAppointments(data);
    }
  };

  loadAppointments();
}, [user]);
```

### Cancel Appointment
```typescript
const handleCancelAppointment = async (appointmentId: string) => {
  const { error } = await cancelAppointment(appointmentId);
  
  if (error) {
    alert('Failed to cancel appointment');
    return;
  }

  // Refresh appointments list
  loadAppointments();
};
```

## Service Management Examples

### Get Services by Industry
```typescript
useEffect(() => {
  if (!industry) return;

  const loadServices = async () => {
    const { data, error } = await getServicesByIndustry(industry.id);
    
    if (data) {
      setServices(data);
    }
  };

  loadServices();
}, [industry]);
```

## Staff Features Examples

### Get Counter Queue
```typescript
useEffect(() => {
  if (!user || user.role !== 'staff') return;

  const loadQueue = async () => {
    // Assuming staff has industry_id in their profile
    const { data, error } = await getQueueByIndustry(user.industry_id!);
    
    if (data) {
      setQueueTickets(data);
    }
  };

  loadQueue();
}, [user]);
```

### Call Next Customer
```typescript
const handleCallNext = async () => {
  if (!nextTicket || !counter) return;

  const { error } = await assignTicketToCounter(
    nextTicket.id,
    counter.id
  );

  if (error) {
    alert('Failed to call customer');
    return;
  }

  alert(`Calling ticket ${nextTicket.ticket_number}`);
};
```

### Update Ticket Status
```typescript
const handleServeCustomer = async (ticketId: string) => {
  const { error } = await updateTicketStatus(ticketId, 'serving');
  
  if (error) {
    alert('Failed to update status');
    return;
  }

  // Update local state
  loadQueue();
};

const handleComplete = async (ticketId: string) => {
  const { error } = await updateTicketStatus(ticketId, 'completed');
  
  if (error) {
    alert('Failed to complete ticket');
    return;
  }

  alert('Customer served successfully!');
  loadQueue();
};
```

## Real-Time Queue Updates (for Staff/Admin)

### Subscribe to Industry Queue
```typescript
useEffect(() => {
  if (!industry) return;

  const subscription = subscribeToQueueUpdates(
    industry.id,
    (payload) => {
      console.log('Queue updated:', payload);
      
      // Refresh queue when changes occur
      loadQueue();
    }
  );

  return () => subscription.unsubscribe();
}, [industry]);
```

## Loading States

```typescript
const [loading, setLoading] = useState(false);

const handleAction = async () => {
  setLoading(true);
  
  try {
    const { data, error } = await someSupabaseFunction();
    
    if (error) {
      alert(error.message);
      return;
    }

    // Success
    console.log('Success:', data);
  } catch (err) {
    alert('An unexpected error occurred');
  } finally {
    setLoading(false);
  }
};
```

## Error Handling Pattern

```typescript
const { data, error } = await supabaseFunction();

if (error) {
  console.error('Error:', error);
  
  // Show user-friendly message
  if (error.message.includes('duplicate')) {
    alert('This record already exists');
  } else if (error.message.includes('not found')) {
    alert('Record not found');
  } else {
    alert('An error occurred. Please try again.');
  }
  
  return;
}

// Process data
console.log('Success:', data);
```

## Conditional Rendering Based on Role

```typescript
const { user } = useAuth();

return (
  <div>
    {user?.role === 'customer' && (
      <CustomerView />
    )}
    
    {user?.role === 'staff' && (
      <StaffView />
    )}
    
    {(user?.role === 'admin' || user?.role === 'superadmin') && (
      <AdminView />
    )}
  </div>
);
```

## Complete Page Example: Appointments with Supabase

```typescript
import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useIndustry } from '../contexts/IndustryContext';
import {
  createAppointment,
  getCustomerAppointments,
  cancelAppointment,
  getServicesByIndustry
} from '../../services/queueService';
import type { Appointment, Service } from '../../lib/supabase';

export function AppointmentsPage() {
  const { user } = useAuth();
  const { industry } = useIndustry();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBooking, setShowBooking] = useState(false);

  // Load appointments and services
  useEffect(() => {
    if (!user || !industry) return;

    const loadData = async () => {
      setLoading(true);
      
      const [appointmentsResult, servicesResult] = await Promise.all([
        getCustomerAppointments(user.id),
        getServicesByIndustry(industry.id)
      ]);

      if (appointmentsResult.data) {
        setAppointments(appointmentsResult.data);
      }

      if (servicesResult.data) {
        setServices(servicesResult.data);
      }

      setLoading(false);
    };

    loadData();
  }, [user, industry]);

  const handleBookAppointment = async (
    serviceId: string,
    date: string,
    time: string
  ) => {
    if (!user || !industry) return;

    const { data, error } = await createAppointment(
      user.id,
      industry.id,
      serviceId,
      date,
      time
    );

    if (error) {
      alert('Failed to book appointment');
      return;
    }

    // Refresh appointments
    const result = await getCustomerAppointments(user.id);
    if (result.data) {
      setAppointments(result.data);
    }

    setShowBooking(false);
  };

  const handleCancel = async (appointmentId: string) => {
    const confirmed = window.confirm('Cancel this appointment?');
    if (!confirmed) return;

    const { error } = await cancelAppointment(appointmentId);

    if (error) {
      alert('Failed to cancel');
      return;
    }

    // Refresh appointments
    if (user) {
      const result = await getCustomerAppointments(user.id);
      if (result.data) {
        setAppointments(result.data);
      }
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>My Appointments</h1>
      
      <button onClick={() => setShowBooking(true)}>
        Book New Appointment
      </button>

      {appointments.map((appointment) => (
        <div key={appointment.id}>
          <p>{appointment.appointment_date} at {appointment.appointment_time}</p>
          <p>Status: {appointment.status}</p>
          
          {appointment.status === 'scheduled' && (
            <button onClick={() => handleCancel(appointment.id)}>
              Cancel
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

## Tips

1. **Always check for user authentication** before making Supabase calls
2. **Handle loading states** to improve UX
3. **Show error messages** that are user-friendly
4. **Refresh data after mutations** (create, update, delete)
5. **Use real-time subscriptions** for live updates
6. **Unsubscribe from subscriptions** in cleanup functions
7. **Check user role** before showing role-specific features

## Common Patterns

### Protected Page
```typescript
const { user, loading } = useAuth();

if (loading) return <div>Loading...</div>;
if (!user) {
  navigate('/login');
  return null;
}

// Render page content
```

### Role-Based Access
```typescript
if (user?.role !== 'admin' && user?.role !== 'superadmin') {
  return <div>Access denied</div>;
}
```

### Refresh Data Function
```typescript
const loadData = async () => {
  if (!user) return;
  
  setLoading(true);
  const { data, error } = await fetchFunction();
  setLoading(false);
  
  if (data) setStateVariable(data);
};

// Call on mount
useEffect(() => { loadData(); }, [user]);

// Call after mutations
const handleCreate = async () => {
  await createFunction();
  loadData(); // Refresh
};
```
