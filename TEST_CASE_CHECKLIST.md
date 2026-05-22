# Smart Queue Management System (SQMS)
# Complete Test Case Checklist

**Version:** 1.0  
**Date:** May 22, 2026  
**Document Type:** Quality Assurance Test Cases  
**Status:** Ready for Testing

---

## Table of Contents

1. [Authentication & User Management](#1-authentication--user-management)
2. [Customer Portal Features](#2-customer-portal-features)
3. [Staff Dashboard Features](#3-staff-dashboard-features)
4. [Admin Dashboard Features](#4-admin-dashboard-features)
5. [Real-Time Updates & Notifications](#5-real-time-updates--notifications)
6. [Queue Management](#6-queue-management)
7. [Appointment System](#7-appointment-system)
8. [Employee Management](#8-employee-management)
9. [Branch & Service Management](#9-branch--service-management)
10. [Analytics & Reporting](#10-analytics--reporting)
11. [UI/UX & Accessibility](#11-uiux--accessibility)
12. [Mobile Responsiveness](#12-mobile-responsiveness)
13. [PWA Features](#13-pwa-features)
14. [Performance Testing](#14-performance-testing)
15. [Security Testing](#15-security-testing)
16. [Browser Compatibility](#16-browser-compatibility)
17. [Error Handling](#17-error-handling)
18. [Data Integrity](#18-data-integrity)

---

## Test Priority Levels

- **P0 (Critical):** Must pass before production deployment
- **P1 (High):** Important functionality, should pass before release
- **P2 (Medium):** Standard functionality
- **P3 (Low):** Nice to have, cosmetic issues

---

## 1. Authentication & User Management

### 1.1 User Registration

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| AUTH-001 | P0 | Register new customer account | 1. Navigate to login page<br>2. Click "Create Account"<br>3. Fill all required fields<br>4. Submit form | Account created, user logged in, redirected to dashboard | [ ] |
| AUTH-002 | P0 | Register with existing email | 1. Attempt registration with existing email | Error: "Email already exists" | [ ] |
| AUTH-003 | P1 | Register with invalid email | 1. Enter invalid email format<br>2. Submit | Validation error displayed | [ ] |
| AUTH-004 | P1 | Register with weak password | 1. Enter password less than 6 characters<br>2. Submit | Validation error: "Password too short" | [ ] |
| AUTH-005 | P1 | Industry selection during registration | 1. Select industry during signup | Account created with selected industry | [ ] |

### 1.2 User Login

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| AUTH-101 | P0 | Login with valid credentials | 1. Enter valid email/password<br>2. Click Login | User authenticated, redirected to appropriate dashboard | [ ] |
| AUTH-102 | P0 | Login with invalid credentials | 1. Enter wrong password<br>2. Click Login | Error: "Invalid credentials" | [ ] |
| AUTH-103 | P1 | Login with non-existent email | 1. Enter email not in system<br>2. Click Login | Error: "User not found" or "Invalid credentials" | [ ] |
| AUTH-104 | P2 | Remember me functionality | 1. Check "Remember Me"<br>2. Login<br>3. Close browser<br>4. Reopen | User still logged in | [ ] |
| AUTH-105 | P1 | Demo account login | 1. Click "Try Demo Account"<br>2. Verify access | Demo user logged in with limited permissions | [ ] |

### 1.3 User Logout

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| AUTH-201 | P0 | Logout from dashboard | 1. Click profile menu<br>2. Click Logout | User logged out, redirected to login page | [ ] |
| AUTH-202 | P1 | Session cleared after logout | 1. Logout<br>2. Press back button | Cannot access protected pages | [ ] |

### 1.4 Password Management

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| AUTH-301 | P1 | Forgot password flow | 1. Click "Forgot Password"<br>2. Enter email<br>3. Submit | Password reset email sent (or mock message shown) | [ ] |
| AUTH-302 | P2 | Change password from profile | 1. Go to Profile<br>2. Update password<br>3. Save | Password updated successfully | [ ] |

### 1.5 Role-Based Access Control

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| AUTH-401 | P0 | Customer cannot access staff pages | 1. Login as customer<br>2. Try to access /staff URL | Redirected to customer dashboard | [ ] |
| AUTH-402 | P0 | Staff cannot access admin pages | 1. Login as staff<br>2. Try to access /admin URL | Access denied or redirected | [ ] |
| AUTH-403 | P0 | Admin can access all pages | 1. Login as admin<br>2. Navigate to staff/customer pages | All pages accessible | [ ] |
| AUTH-404 | P0 | Superadmin has full access | 1. Login as superadmin<br>2. Access all features | Complete system access granted | [ ] |
| AUTH-405 | P1 | Customer mode for staff/admin | 1. Login as staff/admin<br>2. Toggle Customer Mode ON<br>3. Verify navigation | Customer navigation shown, can join queues | [ ] |

---

## 2. Customer Portal Features

### 2.1 Dashboard

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| CUST-001 | P0 | View customer dashboard | 1. Login as customer<br>2. View dashboard | Dashboard displays with services, active tickets, appointments | [ ] |
| CUST-002 | P1 | Quick stats display | 1. Check dashboard stats | Shows: active tickets, upcoming appointments, completed services | [ ] |
| CUST-003 | P2 | Recent activity feed | 1. Check activity section | Recent queue joins, appointments shown | [ ] |

### 2.2 Service Selection & Queue Joining

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| CUST-101 | P0 | Select industry | 1. Go to Services<br>2. Click on industry (e.g., Banking) | Industry selected, services for that industry shown | [ ] |
| CUST-102 | P0 | Select service | 1. Select industry<br>2. Click on service | Service selected, branch selection shown | [ ] |
| CUST-103 | P0 | Select branch location | 1. Complete industry/service selection<br>2. Choose branch | Branch selected, can join queue | [ ] |
| CUST-104 | P0 | Join virtual queue | 1. Select industry/service/branch<br>2. Click "Join Virtual Queue" | Ticket created, ticket number displayed | [ ] |
| CUST-105 | P1 | Cannot join with active ticket | 1. Already have active ticket<br>2. Try to join another queue | Error: "You already have an active ticket" | [ ] |
| CUST-106 | P1 | Service deduplication | 1. View services for any industry | Each service appears only once (no duplicates) | [ ] |
| CUST-107 | P1 | Branch list matches staff branches | 1. View branch selection<br>2. Compare with staff management | Same branches shown in both places | [ ] |
| CUST-108 | P2 | Service estimated time shown | 1. View service selection | Each service shows estimated time if available | [ ] |

### 2.3 Queue Status & Monitoring

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| CUST-201 | P0 | View active ticket | 1. Join queue<br>2. Navigate to Queue Status | Active ticket displayed with number, position, wait time | [ ] |
| CUST-202 | P0 | QR code generation | 1. View active ticket | QR code displayed and scannable | [ ] |
| CUST-203 | P1 | Download QR code | 1. Click "Download QR Code" | QR code image downloaded | [ ] |
| CUST-204 | P1 | Real-time position update | 1. Have active ticket<br>2. Wait for position change | Position updates automatically without refresh | [ ] |
| CUST-205 | P1 | Real-time wait time update | 1. Monitor wait time | Wait time increments every minute | [ ] |
| CUST-206 | P1 | Ticket status transitions | 1. Monitor ticket status | Status changes: waiting → called → serving → completed | [ ] |
| CUST-207 | P0 | Cancel ticket | 1. Have active ticket<br>2. Click Cancel<br>3. Confirm | Ticket cancelled, removed from queue | [ ] |
| CUST-208 | P1 | View ticket history | 1. Go to Queue Status<br>2. View completed tickets | Past tickets displayed with dates and services | [ ] |
| CUST-209 | P1 | Customer information displayed | 1. View active ticket | Shows: name, email, service, branch location | [ ] |

### 2.4 Notifications

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| CUST-301 | P0 | Notification when called | 1. Staff calls customer<br>2. Wait for notification | In-app notification: "Your turn is up! Counter X" | [ ] |
| CUST-302 | P0 | Counter number displayed | 1. Get called by staff<br>2. Check ticket display | Large yellow box shows "Please proceed to Counter X" | [ ] |
| CUST-303 | P1 | Notification when serving starts | 1. Staff marks as serving<br>2. Wait for notification | Notification: "You are now being served" | [ ] |
| CUST-304 | P1 | Notification when service complete | 1. Staff completes service<br>2. Wait for notification | Notification: "Service completed. Thank you!" | [ ] |
| CUST-305 | P1 | Notification center/bell icon | 1. Click bell icon in header | Notification panel opens with history | [ ] |
| CUST-306 | P1 | Unread notification badge | 1. Receive new notification<br>2. Check bell icon | Badge shows unread count | [ ] |
| CUST-307 | P1 | Mark all as read | 1. Open notification panel<br>2. Click "Mark all as read" | All notifications marked read, badge cleared | [ ] |
| CUST-308 | P1 | Notification persistence | 1. Receive notifications<br>2. Close browser<br>3. Reopen | Notification history preserved | [ ] |
| CUST-309 | P2 | Notification auto-dismiss | 1. Receive notification | Popup auto-dismisses after 5-10 seconds | [ ] |

### 2.5 Profile Management

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| CUST-401 | P1 | View profile information | 1. Go to Profile page | Name, email, industry displayed | [ ] |
| CUST-402 | P1 | Edit profile information | 1. Update name/email<br>2. Save changes | Profile updated successfully | [ ] |
| CUST-403 | P2 | Change profile picture | 1. Upload new avatar<br>2. Save | Profile picture updated | [ ] |

---

## 3. Staff Dashboard Features

### 3.1 Dashboard Overview

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| STAFF-001 | P0 | View staff dashboard | 1. Login as staff<br>2. View dashboard | Dashboard shows: assigned counter, queue, completed count | [ ] |
| STAFF-002 | P1 | Real customer data displayed | 1. View waiting queue | Shows real customer names, emails from Supabase | [ ] |
| STAFF-003 | P1 | Accurate wait times | 1. Check customer wait times | Wait times calculated from ticket creation timestamp | [ ] |
| STAFF-004 | P1 | Auto-updating wait times | 1. Monitor wait times | Wait times increment every minute automatically | [ ] |
| STAFF-005 | P1 | Counter assignment shown | 1. Check dashboard header | Assigned counter number displayed | [ ] |
| STAFF-006 | P1 | Daily stats tracking | 1. Complete services throughout day<br>2. Check stats | Completed count increments, avg service time calculated | [ ] |

### 3.2 Queue Management

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| STAFF-101 | P0 | View waiting queue | 1. Login as staff<br>2. View queue section | All waiting customers for staff's services shown | [ ] |
| STAFF-102 | P0 | Call next customer | 1. Click "Call Next Customer" | First customer in queue marked as "called", customer notified | [ ] |
| STAFF-103 | P0 | Customer notification on call | 1. Call next customer<br>2. Verify customer side | Customer receives instant notification with counter number | [ ] |
| STAFF-104 | P0 | Start serving customer | 1. Call customer<br>2. Customer arrives<br>3. Confirm serving | Ticket status updated to "serving" | [ ] |
| STAFF-105 | P0 | Complete service | 1. Finish serving customer<br>2. Click "Complete Service" | Ticket marked complete, customer notified, stats updated | [ ] |
| STAFF-106 | P1 | Skip customer (no-show) | 1. Customer doesn't show<br>2. Click skip/recall | Customer moved to end of queue or marked no-show | [ ] |
| STAFF-107 | P1 | Real-time queue updates | 1. Have queue open<br>2. Customer joins queue (other device) | New customer appears immediately without refresh | [ ] |
| STAFF-108 | P1 | Filter by handled services | 1. View queue | Only customers for services staff handles are shown | [ ] |
| STAFF-109 | P2 | View customer details | 1. Click on customer in queue | Detailed info shown: email, service, wait time, history | [ ] |
| STAFF-110 | P2 | Transfer customer | 1. Select customer<br>2. Click Transfer<br>3. Select department/counter | Customer transferred to another queue | [ ] |

### 3.3 Availability Status

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| STAFF-201 | P1 | Set status to "On Break" | 1. Toggle status to break<br>2. Try to call next | Cannot call customers while on break | [ ] |
| STAFF-202 | P1 | Set status to "Available" | 1. Toggle status to available<br>2. Call next | Can call and serve customers | [ ] |
| STAFF-203 | P2 | Status indicator shown | 1. Change status | Visual indicator shows current status (green/yellow/red) | [ ] |

### 3.4 Staff Notifications

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| STAFF-301 | P1 | New customer notification | 1. Customer joins queue for staff's service | In-app notification: "New customer joined: [ticket] for [service]" | [ ] |
| STAFF-302 | P2 | Notification history | 1. View notification panel | Last 5 notifications shown | [ ] |

---

## 4. Admin Dashboard Features

### 4.1 Dashboard Overview

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| ADMIN-001 | P0 | View admin dashboard | 1. Login as admin<br>2. View dashboard | Overview of all queues, staff, analytics | [ ] |
| ADMIN-002 | P1 | Multi-industry view (superadmin) | 1. Login as superadmin<br>2. View dashboard | Can view/filter all industries | [ ] |
| ADMIN-003 | P1 | Single industry view (admin) | 1. Login as admin<br>2. View dashboard | Only assigned industry data shown | [ ] |

### 4.2 Employee Management

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| ADMIN-101 | P0 | View employee list | 1. Go to Employee Management | All staff for industry shown | [ ] |
| ADMIN-102 | P0 | Assign staff to branch | 1. Click manage on staff member<br>2. Select branch<br>3. Save | Staff assigned to branch in database | [ ] |
| ADMIN-103 | P0 | Cannot assign mismatched branch | 1. Try to assign staff to branch in different industry | Error: "Staff industry must match branch industry" | [ ] |
| ADMIN-104 | P0 | Assign services to staff | 1. Click manage on staff member<br>2. Select services<br>3. Save | Staff can handle selected services | [ ] |
| ADMIN-105 | P1 | View staff assignments | 1. View employee table | Branch and assigned services shown for each staff | [ ] |
| ADMIN-106 | P1 | Staff services match customer services | 1. View staff services<br>2. Compare to customer service selection | Exact same services (no duplicates) | [ ] |
| ADMIN-107 | P1 | Filter employees by industry (superadmin) | 1. Login as superadmin<br>2. Select industry filter | Only employees for selected industry shown | [ ] |
| ADMIN-108 | P2 | Search employees | 1. Use search bar<br>2. Enter name/email | Matching employees shown | [ ] |

### 4.3 Queue Monitoring

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| ADMIN-201 | P1 | View all active queues | 1. Go to queue monitoring | All active tickets across all counters shown | [ ] |
| ADMIN-202 | P1 | Override/manage tickets | 1. Select ticket<br>2. Change status/priority | Ticket updated, staff/customer notified | [ ] |
| ADMIN-203 | P2 | View queue history | 1. Access historical queues | Past tickets with completion stats shown | [ ] |

---

## 5. Real-Time Updates & Notifications

### 5.1 Real-Time Synchronization

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| RT-001 | P0 | Customer joins queue | 1. Customer creates ticket<br>2. Check staff dashboard (no refresh) | New ticket appears on staff dashboard within 2 seconds | [ ] |
| RT-002 | P0 | Staff calls customer | 1. Staff calls next<br>2. Check customer page (no refresh) | Customer receives notification within 2 seconds | [ ] |
| RT-003 | P0 | Status change propagation | 1. Update ticket status<br>2. Check all connected clients | All clients show updated status within 2 seconds | [ ] |
| RT-004 | P1 | Multiple staff see same queue | 1. Open staff dashboard on 2 devices<br>2. Call customer on device 1 | Device 2 updates immediately, customer removed from queue | [ ] |
| RT-005 | P1 | WebSocket connection stable | 1. Keep page open for 30 minutes | Real-time updates continue working, no disconnections | [ ] |
| RT-006 | P1 | Reconnection after network loss | 1. Disconnect internet<br>2. Wait 10 seconds<br>3. Reconnect | App reconnects, syncs latest data | [ ] |

### 5.2 Notification System

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| NOTIF-001 | P0 | In-app notification display | 1. Trigger notification event | Popup appears in top-right corner | [ ] |
| NOTIF-002 | P1 | Notification types | 1. Trigger success/error/info notifications | Color-coded: green (success), red (error), blue (info) | [ ] |
| NOTIF-003 | P1 | Notification auto-dismiss | 1. Show notification | Dismisses automatically after 5-10 seconds | [ ] |
| NOTIF-004 | P2 | Manual dismiss | 1. Show notification<br>2. Click X button | Notification closes immediately | [ ] |
| NOTIF-005 | P2 | Multiple notifications | 1. Trigger 3 notifications quickly | All 3 show stacked, don't overlap | [ ] |

---

## 6. Queue Management

### 6.1 Ticket Creation

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| QUEUE-001 | P0 | Ticket number generation | 1. Create ticket | Unique ticket number assigned (e.g., A001, A002) | [ ] |
| QUEUE-002 | P0 | Ticket saved to database | 1. Create ticket<br>2. Check Supabase | Ticket record exists with all fields populated | [ ] |
| QUEUE-003 | P1 | Position calculation | 1. Create ticket | Correct position assigned based on existing queue | [ ] |
| QUEUE-004 | P1 | Wait time estimation | 1. Create ticket | Estimated wait time calculated (position × avg service time) | [ ] |
| QUEUE-005 | P1 | Branch ID saved | 1. Create ticket with branch<br>2. Check database | branch_id field populated correctly | [ ] |

### 6.2 Queue Status Transitions

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| QUEUE-101 | P0 | Waiting → Called | 1. Staff calls customer | Status updates to "called", called_at timestamp set | [ ] |
| QUEUE-102 | P0 | Called → Serving | 1. Staff confirms serving | Status updates to "serving", served_at timestamp set | [ ] |
| QUEUE-103 | P0 | Serving → Completed | 1. Staff completes service | Status updates to "completed", completed_at timestamp set | [ ] |
| QUEUE-104 | P1 | Waiting → Cancelled | 1. Customer cancels ticket | Status updates to "cancelled" | [ ] |
| QUEUE-105 | P1 | Invalid status transitions | 1. Try to mark waiting ticket as completed directly | Transition blocked or goes through intermediary states | [ ] |

### 6.3 Queue Position Management

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| QUEUE-201 | P1 | Position updates on completion | 1. Complete first ticket<br>2. Check all other tickets | All positions decrement by 1 | [ ] |
| QUEUE-202 | P1 | Position updates on cancellation | 1. Cancel ticket in middle<br>2. Check following tickets | Positions adjust automatically | [ ] |
| QUEUE-203 | P2 | Priority handling | 1. Mark ticket as priority<br>2. Check position | Priority ticket moved up in queue | [ ] |

---

## 7. Appointment System

### 7.1 Appointment Booking

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| APPT-001 | P1 | Book new appointment | 1. Go to Appointments<br>2. Select service/date/time<br>3. Confirm | Appointment created and saved | [ ] |
| APPT-002 | P1 | Cannot book past date | 1. Try to select past date | Date picker blocks past dates | [ ] |
| APPT-003 | P1 | Time slot availability | 1. View time slots | Only available slots shown | [ ] |
| APPT-004 | P1 | Appointment confirmation | 1. Book appointment<br>2. Check email/notification | Confirmation message shown | [ ] |

### 7.2 Appointment Management

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| APPT-101 | P1 | View upcoming appointments | 1. Go to Appointments page | All future appointments listed | [ ] |
| APPT-102 | P1 | Reschedule appointment | 1. Select appointment<br>2. Choose new date/time<br>3. Confirm | Appointment updated with new time | [ ] |
| APPT-103 | P1 | Cancel appointment | 1. Select appointment<br>2. Click Cancel<br>3. Confirm | Appointment cancelled, slot freed | [ ] |
| APPT-104 | P2 | Appointment reminders | 1. Have appointment tomorrow<br>2. Check notifications | Reminder notification shown | [ ] |

---

## 8. Employee Management

### 8.1 Staff Assignment

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| EMP-001 | P0 | Assign staff to branch | 1. Admin selects staff<br>2. Assigns branch<br>3. Saves | Staff branch_id updated in database | [ ] |
| EMP-002 | P0 | Staff branch matches industry | 1. View staff's industry<br>2. View assigned branch's industry | Both industries match | [ ] |
| EMP-003 | P0 | Branch validation | 1. Try to assign healthcare staff to banking branch | Error: "Industry mismatch" | [ ] |
| EMP-004 | P1 | Assign multiple services | 1. Select staff<br>2. Assign 3 services<br>3. Save | All 3 services linked in staff_services table | [ ] |
| EMP-005 | P1 | Remove service assignment | 1. Uncheck assigned service<br>2. Save | Service removed from staff_services | [ ] |

### 8.2 Staff Permissions

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| EMP-101 | P1 | Staff sees only assigned services | 1. Login as staff<br>2. View queue | Only tickets for assigned services shown | [ ] |
| EMP-102 | P1 | Staff cannot handle unassigned service | 1. Login as staff<br>2. Try to call customer for unassigned service | Error or customer not in queue | [ ] |

---

## 9. Branch & Service Management

### 9.1 Branch Management

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| BRANCH-001 | P1 | View all branches | 1. Go to branch management (if available) | All active branches listed by industry | [ ] |
| BRANCH-002 | P1 | Branches load from Supabase | 1. View customer branch selection<br>2. Check Supabase | Branch list matches database | [ ] |
| BRANCH-003 | P1 | Branch deduplication | 1. View branch selection | Each branch appears only once | [ ] |

### 9.2 Service Management

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| SERV-001 | P0 | Services deduplicated | 1. View service selection for any industry | Each service name appears only once | [ ] |
| SERV-002 | P1 | Services load from Supabase | 1. View services<br>2. Check Supabase | Service list matches database | [ ] |
| SERV-003 | P1 | Service estimated time | 1. View service details | Estimated time shown if set in database | [ ] |

---

## 10. Analytics & Reporting

### 10.1 Dashboard Analytics

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| ANALYTICS-001 | P2 | View daily statistics | 1. Go to Analytics page | Total tickets, completed, average wait shown | [ ] |
| ANALYTICS-002 | P2 | Charts render correctly | 1. View analytics charts | Charts display without errors | [ ] |
| ANALYTICS-003 | P2 | Export reports | 1. Click Export<br>2. Choose format | Report downloaded in chosen format | [ ] |

---

## 11. UI/UX & Accessibility

### 11.1 User Interface

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| UI-001 | P1 | Consistent styling | 1. Navigate through all pages | Consistent colors, fonts, spacing throughout | [ ] |
| UI-002 | P1 | Loading states | 1. Trigger data loading<br>2. Observe | Loading spinners shown appropriately | [ ] |
| UI-003 | P1 | Empty states | 1. View page with no data | Friendly empty state message shown | [ ] |
| UI-004 | P1 | Form validation | 1. Submit incomplete form | Validation errors shown clearly | [ ] |
| UI-005 | P2 | Tooltips and help text | 1. Hover over info icons | Helpful tooltips appear | [ ] |

### 11.2 Accessibility

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| A11Y-001 | P1 | Keyboard navigation | 1. Navigate using Tab key only | All interactive elements accessible | [ ] |
| A11Y-002 | P1 | Screen reader compatibility | 1. Use screen reader (NVDA/JAWS) | All content readable, proper ARIA labels | [ ] |
| A11Y-003 | P2 | Color contrast | 1. Use contrast checker tool | All text meets WCAG AA standards (4.5:1) | [ ] |
| A11Y-004 | P2 | Focus indicators | 1. Tab through page | Focused elements clearly highlighted | [ ] |

---

## 12. Mobile Responsiveness

### 12.1 Mobile Layout

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| MOBILE-001 | P0 | Mobile navigation | 1. Open on mobile (375px)<br>2. Test menu | Hamburger menu works, all pages accessible | [ ] |
| MOBILE-002 | P0 | Touch targets | 1. Test buttons on mobile | All buttons easily tappable (min 44x44px) | [ ] |
| MOBILE-003 | P1 | Responsive tables | 1. View data tables on mobile | Tables scroll or stack appropriately | [ ] |
| MOBILE-004 | P1 | Forms on mobile | 1. Fill forms on mobile | Inputs properly sized, keyboard friendly | [ ] |

### 12.2 Device Testing

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| DEVICE-001 | P1 | iPhone display | 1. Test on iPhone (Safari) | Layout correct, features work | [ ] |
| DEVICE-002 | P1 | Android display | 1. Test on Android (Chrome) | Layout correct, features work | [ ] |
| DEVICE-003 | P1 | Tablet display | 1. Test on iPad/tablet | Layout adapts to larger screen | [ ] |
| DEVICE-004 | P2 | Landscape orientation | 1. Rotate device to landscape | Layout remains usable | [ ] |

---

## 13. PWA Features

### 13.1 Installation

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| PWA-001 | P2 | Install prompt appears | 1. Visit site multiple times | Install prompt appears | [ ] |
| PWA-002 | P2 | Add to home screen | 1. Install PWA<br>2. Check home screen | App icon appears on home screen | [ ] |
| PWA-003 | P2 | Standalone mode | 1. Open installed PWA | App opens without browser chrome | [ ] |

### 13.2 Offline Functionality

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| PWA-101 | P3 | Service worker registration | 1. Check DevTools > Application | Service worker registered successfully | [ ] |
| PWA-102 | P3 | Basic offline access | 1. Load app<br>2. Go offline<br>3. Refresh | Cached pages still accessible | [ ] |

---

## 14. Performance Testing

### 14.1 Load Times

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| PERF-001 | P1 | Initial page load | 1. Clear cache<br>2. Load homepage<br>3. Measure time | Page loads in under 3 seconds | [ ] |
| PERF-002 | P1 | Dashboard load | 1. Login<br>2. Time dashboard render | Dashboard renders in under 2 seconds | [ ] |
| PERF-003 | P2 | Image optimization | 1. Check Network tab | Images properly compressed (WebP/AVIF) | [ ] |

### 14.2 Scalability

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| PERF-101 | P1 | Large queue (100+ tickets) | 1. Create 100 tickets<br>2. View staff dashboard | Page remains responsive | [ ] |
| PERF-102 | P1 | Multiple real-time connections | 1. Open 10 browser tabs<br>2. Monitor performance | All tabs receive updates without lag | [ ] |

---

## 15. Security Testing

### 15.1 Authentication Security

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| SEC-001 | P0 | SQL injection prevention | 1. Enter SQL in input fields<br>2. Submit | Input sanitized, no database error | [ ] |
| SEC-002 | P0 | XSS prevention | 1. Enter `<script>alert('XSS')</script>`<br>2. Submit | Script not executed, displayed as text | [ ] |
| SEC-003 | P0 | Session security | 1. Login<br>2. Inspect cookies/localStorage | Sensitive data encrypted/hashed | [ ] |
| SEC-004 | P0 | HTTPS enforcement | 1. Try HTTP connection | Redirected to HTTPS | [ ] |

### 15.2 Authorization Security

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| SEC-101 | P0 | Direct URL access blocked | 1. Logout<br>2. Try to access /admin directly | Redirected to login | [ ] |
| SEC-102 | P0 | API endpoint protection | 1. Call API without auth token | 401 Unauthorized error | [ ] |
| SEC-103 | P0 | Role escalation prevention | 1. Modify role in localStorage<br>2. Try admin action | Backend validates role, action denied | [ ] |

### 15.3 Data Privacy

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| SEC-201 | P1 | User data isolation | 1. Login as User A<br>2. Try to access User B's data | Access denied | [ ] |
| SEC-202 | P1 | No sensitive data in URLs | 1. Navigate through app<br>2. Check URLs | No passwords/tokens in query strings | [ ] |

---

## 16. Browser Compatibility

### 16.1 Desktop Browsers

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| BROWSER-001 | P0 | Chrome (latest) | 1. Test all features in Chrome | All features work perfectly | [ ] |
| BROWSER-002 | P0 | Firefox (latest) | 1. Test all features in Firefox | All features work perfectly | [ ] |
| BROWSER-003 | P1 | Safari (latest) | 1. Test all features in Safari | All features work perfectly | [ ] |
| BROWSER-004 | P1 | Edge (latest) | 1. Test all features in Edge | All features work perfectly | [ ] |

### 16.2 Mobile Browsers

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| BROWSER-101 | P0 | Safari iOS | 1. Test on iPhone Safari | All features work | [ ] |
| BROWSER-102 | P0 | Chrome Android | 1. Test on Android Chrome | All features work | [ ] |

---

## 17. Error Handling

### 17.1 User-Facing Errors

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| ERROR-001 | P0 | Network error | 1. Disconnect internet<br>2. Try to load data | Friendly error message shown | [ ] |
| ERROR-002 | P0 | Form submission error | 1. Submit invalid form | Clear validation errors shown | [ ] |
| ERROR-003 | P0 | 404 Page not found | 1. Navigate to invalid URL | Custom 404 page shown | [ ] |
| ERROR-004 | P1 | API error | 1. Trigger API error (mock)<br>2. Observe | User-friendly error message, not technical details | [ ] |

### 17.2 Error Boundary

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| ERROR-101 | P0 | React component error | 1. Trigger component error (mock)<br>2. Observe | Error boundary catches, shows fallback UI | [ ] |
| ERROR-102 | P1 | Error logged to console | 1. Trigger error<br>2. Check console | Error logged to console.error (for debugging) | [ ] |

### 17.3 Console Errors

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| ERROR-201 | P0 | No console errors on load | 1. Open DevTools Console<br>2. Load each page | 0 errors in console | [ ] |
| ERROR-202 | P0 | No console warnings | 1. Navigate through app<br>2. Monitor console | 0 warnings (or only acceptable ones) | [ ] |
| ERROR-203 | P0 | No React warnings | 1. Use React DevTools<br>2. Check for warnings | No key warnings, dependency warnings | [ ] |

---

## 18. Data Integrity

### 18.1 Database Operations

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| DATA-001 | P0 | Data persistence | 1. Create ticket<br>2. Refresh page | Data still present after refresh | [ ] |
| DATA-002 | P0 | No duplicate tickets | 1. Rapidly click "Join Queue" 5 times | Only 1 ticket created | [ ] |
| DATA-003 | P0 | Foreign key integrity | 1. Delete user<br>2. Check related tickets | Tickets handled appropriately (cascade or set null) | [ ] |
| DATA-004 | P1 | Transaction rollback | 1. Trigger partial failure (mock)<br>2. Check database | All-or-nothing, no partial writes | [ ] |

### 18.2 Data Validation

| Test Case ID | Priority | Test Case | Steps | Expected Result | Status |
|--------------|----------|-----------|-------|-----------------|--------|
| DATA-101 | P0 | Required fields enforced | 1. Try to create record without required field | Database rejects, error returned | [ ] |
| DATA-102 | P1 | Data type validation | 1. Send string to number field<br>2. Submit | Validation error before database | [ ] |
| DATA-103 | P1 | Unique constraints | 1. Try to create duplicate email | Error: "Email already exists" | [ ] |

---

## Test Execution Summary

### Test Statistics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Total Test Cases | 300+ | - | [ ] |
| P0 Tests Passed | 100% | - | [ ] |
| P1 Tests Passed | ≥95% | - | [ ] |
| P2 Tests Passed | ≥90% | - | [ ] |
| P3 Tests Passed | ≥80% | - | [ ] |
| Console Errors | 0 | - | [ ] |
| Critical Bugs | 0 | - | [ ] |

---

## Test Environment Setup

### Prerequisites

1. **Supabase Database:**
   - Run `ADD_BRANCH_TO_TICKETS.sql` migration
   - Run `FIX_DATA_ISSUES.sql` to clean duplicates
   - Verify RLS policies are enabled

2. **Test Data:**
   - Create test users for each role (customer, staff, admin, superadmin)
   - Seed services and branches for all industries
   - Create sample tickets and appointments

3. **Testing Tools:**
   - Browser DevTools (Chrome, Firefox)
   - React DevTools extension
   - Lighthouse (performance/accessibility)
   - Screen reader (NVDA/JAWS)
   - Mobile device emulators or real devices

4. **Credentials:**
   - Document all test user credentials
   - Note API keys and environment variables

---

## Bug Reporting Template

When a test fails, report using this format:

```
Bug ID: BUG-XXX
Test Case ID: [e.g., AUTH-001]
Priority: [P0/P1/P2/P3]
Title: [Short description]

Steps to Reproduce:
1. 
2. 
3. 

Expected Result:


Actual Result:


Environment:
- Browser: 
- OS: 
- Device: 

Screenshots/Videos:


Additional Notes:

```

---

## Sign-Off

### Tester Sign-Off

| Name | Role | Date | Signature |
|------|------|------|-----------|
| | QA Lead | | |
| | QA Engineer | | |
| | Product Owner | | |

### Approval for Production

- [ ] All P0 tests passed
- [ ] All P1 tests passed or issues documented with workarounds
- [ ] Security review completed
- [ ] Performance benchmarks met
- [ ] User acceptance testing completed
- [ ] Documentation updated

**Approved By:** ________________  
**Date:** ________________

---

## Appendix

### A. Glossary

- **SQMS:** Smart Queue Management System
- **P0-P3:** Test priority levels
- **RLS:** Row Level Security (Supabase)
- **PWA:** Progressive Web App
- **RT:** Real-Time

### B. Related Documents

- `CONSOLE_ERRORS_FIXED.md` - Console error fixes
- `REALTIME_STAFF_CUSTOMER_UPDATES.md` - Real-time feature documentation
- `DUPLICATE_SERVICES_AND_BRANCH_FIX.md` - Data integrity fixes
- `REAL_TIME_UPDATES_SUMMARY.md` - Real-time implementation details

### C. Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2026-05-22 | Initial test case checklist | QA Team |

---

**End of Test Case Checklist**
