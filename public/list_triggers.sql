
SELECT 
    event_object_table as table_name, 
    trigger_name 
FROM 
    information_schema.triggers 
WHERE 
    event_object_table IN ('orders', 'withdrawal_requests')
ORDER BY 
    event_object_table, trigger_name;
