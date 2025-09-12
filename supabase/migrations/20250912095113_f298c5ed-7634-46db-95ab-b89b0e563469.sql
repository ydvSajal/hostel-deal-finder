-- Fix the function search path issue from the linter
CREATE OR REPLACE FUNCTION public.check_otp_rate_limit(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    last_request_time timestamp;
    rate_limit_window interval := '60 seconds';
BEGIN
    -- Get the last OTP request time for this email from auth logs
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

-- Create the otp_rate_limits table for better rate limiting
CREATE TABLE IF NOT EXISTS public.otp_rate_limits (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text NOT NULL,
    request_count integer DEFAULT 1,
    window_start timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.otp_rate_limits ENABLE ROW LEVEL SECURITY;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_otp_rate_limits_email_window ON public.otp_rate_limits(email, window_start);

-- Update the function to use the new table
CREATE OR REPLACE FUNCTION public.check_otp_rate_limit(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_count INTEGER;
  latest_request TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Clean up old entries (older than 60 seconds)
  DELETE FROM public.otp_rate_limits 
  WHERE window_start < (now() - INTERVAL '60 seconds');
  
  -- Check current rate limit for this email in the last 60 seconds
  SELECT request_count, window_start 
  INTO current_count, latest_request
  FROM public.otp_rate_limits 
  WHERE email = user_email 
  AND window_start > (now() - INTERVAL '60 seconds')
  ORDER BY window_start DESC 
  LIMIT 1;
  
  -- If no recent requests, allow and create new record
  IF current_count IS NULL THEN
    INSERT INTO public.otp_rate_limits (email, request_count, window_start) 
    VALUES (user_email, 1, now());
    RETURN TRUE;
  END IF;
  
  -- If within 60 second window and less than 3 requests, increment
  IF current_count < 3 THEN
    UPDATE public.otp_rate_limits 
    SET request_count = request_count + 1 
    WHERE email = user_email 
    AND window_start = latest_request;
    RETURN TRUE;
  END IF;
  
  -- Rate limit exceeded
  RETURN FALSE;
END;
$$;