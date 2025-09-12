-- Create the check_otp_rate_limit function that's missing
CREATE OR REPLACE FUNCTION public.check_otp_rate_limit(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    last_request_time timestamp;
    rate_limit_window interval := '60 seconds';
BEGIN
    -- Get the last OTP request time for this email
    SELECT created_at INTO last_request_time
    FROM auth.audit_log_entries
    WHERE 
        payload->>'email' = user_email 
        AND payload->>'action' = 'login'
        AND payload->>'via' = 'otp'
    ORDER BY created_at DESC
    LIMIT 1;
    
    -- If no previous request or enough time has passed, allow the request
    IF last_request_time IS NULL OR (now() - last_request_time) > rate_limit_window THEN
        RETURN true;
    ELSE
        RETURN false;
    END IF;
END;
$$;