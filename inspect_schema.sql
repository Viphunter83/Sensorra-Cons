SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable, 
    udt_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'properties', 'documents', 'audit_logs')
ORDER BY table_name, ordinal_position;
