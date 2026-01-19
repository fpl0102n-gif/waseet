-- Vérifier les triggers
SELECT tgname, tgenabled 
FROM pg_trigger 
WHERE tgname LIKE 'trigger_notify%';

-- Vérifier la table settings
SELECT * FROM public.alkhayr_settings;

-- Vérifier si pg_net extension existe
SELECT * FROM pg_extension WHERE extname = 'pg_net';
