-- Debug Telegram Triggers
-- Run this to check if triggers exist and are valid

SELECT 
    event_object_table as table_name,
    trigger_name,
    event_manipulation as event,
    action_statement as action
FROM information_schema.triggers
WHERE trigger_name LIKE 'trg_notify_%'
ORDER BY event_object_table;

-- Verify columns for Blood Donors
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'blood_donors';

-- Verify columns for Orders
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'orders';
