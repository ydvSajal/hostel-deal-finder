-- Fix the OTP rate limiting function logic
CREATE OR REPLACE FUNCTION public.check_otp_rate_limit(user_email text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;