-- =====================================================
-- ADD BRANCH_ID TO QUEUE TICKETS AND APPOINTMENTS
-- =====================================================
-- This adds branch tracking to tickets and appointments
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add branch_id to queue_tickets table
ALTER TABLE queue_tickets
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES businesses(id) ON DELETE SET NULL;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_queue_tickets_branch ON queue_tickets(branch_id);

-- Add branch_id to appointments table
ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES businesses(id) ON DELETE SET NULL;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_appointments_branch ON appointments(branch_id);

-- Verify columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'queue_tickets'
AND column_name = 'branch_id';

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'appointments'
AND column_name = 'branch_id';

-- =====================================================
-- DONE! ✅
-- =====================================================
-- Queue tickets and appointments now track which branch they're for
-- =====================================================
