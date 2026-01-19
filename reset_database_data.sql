-- ⚠️ DANGER: THIS SCRIPT DELETES ALL USER DATA ⚠️
-- Failure-Safe Version: Ignores missing tables.
-- Run this to reset the database content.

BEGIN;

-- 1. Store / Orders
DO $$ BEGIN EXECUTE 'TRUNCATE TABLE public.orders RESTART IDENTITY CASCADE'; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN EXECUTE 'TRUNCATE TABLE public.order_items RESTART IDENTITY CASCADE'; EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- 2. Exchange / Import / Suggestions
DO $$ BEGIN EXECUTE 'TRUNCATE TABLE public.exchange_requests RESTART IDENTITY CASCADE'; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN EXECUTE 'TRUNCATE TABLE public.import_requests RESTART IDENTITY CASCADE'; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN EXECUTE 'TRUNCATE TABLE public.product_suggestions RESTART IDENTITY CASCADE'; EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- 3. Agents
DO $$ BEGIN EXECUTE 'TRUNCATE TABLE public.agent_profiles RESTART IDENTITY CASCADE'; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN EXECUTE 'TRUNCATE TABLE public.agent_registrations RESTART IDENTITY CASCADE'; EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- 4. Blood Donation
DO $$ BEGIN EXECUTE 'TRUNCATE TABLE public.blood_donors RESTART IDENTITY CASCADE'; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN EXECUTE 'TRUNCATE TABLE public.transport_volunteers RESTART IDENTITY CASCADE'; EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- 5. Alkhayr (Humanitarian)
DO $$ BEGIN EXECUTE 'TRUNCATE TABLE public.material_donations RESTART IDENTITY CASCADE'; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN EXECUTE 'TRUNCATE TABLE public.humanitarian_medicines RESTART IDENTITY CASCADE'; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN EXECUTE 'TRUNCATE TABLE public.local_medicine_requests RESTART IDENTITY CASCADE'; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN EXECUTE 'TRUNCATE TABLE public.foreign_medicine_requests RESTART IDENTITY CASCADE'; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN EXECUTE 'TRUNCATE TABLE public.alkhayr_requests RESTART IDENTITY CASCADE'; EXCEPTION WHEN undefined_table OR wrong_object_type THEN NULL; END $$;
-- Legacy names just in case
DO $$ BEGIN EXECUTE 'TRUNCATE TABLE public.alkhayr_requests_local RESTART IDENTITY CASCADE'; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN EXECUTE 'TRUNCATE TABLE public.alkhayr_requests_foreign RESTART IDENTITY CASCADE'; EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- 6. Store & Products
DO $$ BEGIN EXECUTE 'TRUNCATE TABLE public.products RESTART IDENTITY CASCADE'; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN EXECUTE 'TRUNCATE TABLE public.store_product_suggestions RESTART IDENTITY CASCADE'; EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- 7. Referrals & Withdrawals
DO $$ BEGIN EXECUTE 'TRUNCATE TABLE public.withdrawal_requests RESTART IDENTITY CASCADE'; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN EXECUTE 'TRUNCATE TABLE public.referral_codes RESTART IDENTITY CASCADE'; EXCEPTION WHEN undefined_table THEN NULL; END $$;

-- 8. Logs
DO $$ BEGIN EXECUTE 'TRUNCATE TABLE public.debug_notification_logs RESTART IDENTITY CASCADE'; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN EXECUTE 'TRUNCATE TABLE public.debug_email_logs RESTART IDENTITY CASCADE'; EXCEPTION WHEN undefined_table THEN NULL; END $$;
DO $$ BEGIN EXECUTE 'TRUNCATE TABLE public.debug_trigger_logs RESTART IDENTITY CASCADE'; EXCEPTION WHEN undefined_table THEN NULL; END $$;

COMMIT;

-- Verify deletion
SELECT 'Database Cleared Successfully (Ignored missing tables)' as status;
