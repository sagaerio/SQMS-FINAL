-- =====================================================
-- ENABLE REAL-TIME FOR ALL TABLES
-- =====================================================
-- This enables real-time subscriptions for all tables
-- so your app can receive live updates when data changes

-- Remove tables from publication first (in case they're already there)
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS users;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS services;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS businesses;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS counters;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS queue_tickets;
ALTER PUBLICATION supabase_realtime DROP TABLE IF EXISTS appointments;

-- Add all tables to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE users;
ALTER PUBLICATION supabase_realtime ADD TABLE services;
ALTER PUBLICATION supabase_realtime ADD TABLE businesses;
ALTER PUBLICATION supabase_realtime ADD TABLE counters;
ALTER PUBLICATION supabase_realtime ADD TABLE queue_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE appointments;

-- Note: industries table is static and doesn't need realtime

-- =====================================================
-- VERIFY REALTIME IS ENABLED
-- =====================================================
-- Run this query to verify:
-- SELECT tablename FROM pg_publication_tables WHERE pubname = 'supabase_realtime';

-- You should see:
-- - users
-- - services
-- - businesses
-- - counters
-- - queue_tickets
-- - appointments

-- =====================================================
-- WHAT THIS ENABLES
-- =====================================================
-- ✅ Users table: See new staff/admin additions live
-- ✅ Services table: See service changes instantly
-- ✅ Businesses table: See new business approvals live
-- ✅ Counters table: See counter status changes (active/on_break)
-- ✅ Queue tickets: See new customers joining queue live
-- ✅ Appointments: See new bookings instantly

-- =====================================================
-- NEXT STEP: Configure Supabase Dashboard
-- =====================================================
-- After running this SQL:
-- 1. Go to Database → Replication in Supabase Dashboard
-- 2. You should see all 6 tables listed with "enabled" status
-- 3. If not visible, enable them manually by toggling each table
