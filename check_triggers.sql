-- Check if the triggers exist
SELECT 
    event_object_table as table_name,
    trigger_name,
    event_manipulation as event,
    action_statement as definition
FROM information_schema.triggers
WHERE event_object_table = 'orders'
AND trigger_name IN ('on_order_created_email', 'on_order_updated_email');
