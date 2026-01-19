-- FIX TRIGGER SYNTAX ERROR (ATTEMPT 3 - SINGLE QUOTES)
-- Using standard single quotes to avoid parser issues with $$ or $func$

CREATE OR REPLACE FUNCTION public.handle_new_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS '
DECLARE
  request_headers json;
  base_url text;
  final_url text;
BEGIN
  -- 1. Safely get headers
  BEGIN
    request_headers := CAST(current_setting(''request.headers'', true) AS json);
  EXCEPTION WHEN OTHERS THEN
    request_headers := ''{}''::json;
  END;

  -- 2. Determine URL
  base_url := request_headers->>''x-forwarded-host'';
  
  IF base_url IS NULL OR base_url = '''' THEN
     base_url := ''localhost:54321'';
  END IF;

  final_url := ''https://'' || base_url || ''/functions/v1/send-email'';
  
  -- FORCE HTTP FOR LOCALHOST/127.0.0.1
  IF base_url LIKE ''%localhost%'' OR base_url LIKE ''%127.0.0.1%'' THEN
      final_url := ''http://'' || base_url || ''/functions/v1/send-email'';
  END IF;

  -- 3. LOGGING
  INSERT INTO public.debug_email_logs (message, details)
  VALUES (
    ''Trigger Fired (Single Quote Fix)'', 
    jsonb_build_object(
        ''type'', TG_ARGV[0],
        ''url'', final_url,
        ''record_id'', NEW.id
    )
  );

  -- 4. Send Request
  PERFORM
    net.http_post(
      url := final_url,
      headers := jsonb_build_object(
        ''Content-Type'', ''application/json'',
        ''Authorization'', current_setting(''request.headers'', true)::json->>''authorization''
      ),
      body := jsonb_build_object(
        ''type'', TG_ARGV[0],
        ''record'', row_to_json(NEW)
      )
    );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    INSERT INTO public.debug_email_logs (message, details)
    VALUES (''Trigger Crashed'', jsonb_build_object(''error'', SQLERRM));
    RETURN NEW;
END;
';
