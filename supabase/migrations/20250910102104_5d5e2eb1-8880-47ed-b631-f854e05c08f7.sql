-- Security Fix 1: Implement field-level access control for PII data
-- Create audit log table for profile changes
CREATE TABLE public.profile_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  field_changed TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  changed_by UUID NOT NULL DEFAULT auth.uid()
);

-- Enable RLS on audit log
ALTER TABLE public.profile_audit_log ENABLE ROW LEVEL SECURITY;

-- Only allow admins to view audit logs (for now, only the user can see their own)
CREATE POLICY "Users can view their own audit logs" 
ON public.profile_audit_log 
FOR SELECT 
USING (user_id = auth.uid());

-- Create function to audit PII changes
CREATE OR REPLACE FUNCTION public.audit_profile_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Audit sensitive PII fields
  IF OLD.full_name IS DISTINCT FROM NEW.full_name THEN
    INSERT INTO public.profile_audit_log (user_id, field_changed, old_value, new_value)
    VALUES (NEW.id, 'full_name', OLD.full_name, NEW.full_name);
  END IF;
  
  IF OLD.mobile_number IS DISTINCT FROM NEW.mobile_number THEN
    INSERT INTO public.profile_audit_log (user_id, field_changed, old_value, new_value)
    VALUES (NEW.id, 'mobile_number', OLD.mobile_number, NEW.mobile_number);
  END IF;
  
  IF OLD.hostel_name IS DISTINCT FROM NEW.hostel_name THEN
    INSERT INTO public.profile_audit_log (user_id, field_changed, old_value, new_value)
    VALUES (NEW.id, 'hostel_name', OLD.hostel_name, NEW.hostel_name);
  END IF;
  
  IF OLD.room_number IS DISTINCT FROM NEW.room_number THEN
    INSERT INTO public.profile_audit_log (user_id, field_changed, old_value, new_value)
    VALUES (NEW.id, 'room_number', OLD.room_number, NEW.room_number);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for profile audit
CREATE TRIGGER audit_profile_changes
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_profile_changes();

-- Create server-side validation function for profiles
CREATE OR REPLACE FUNCTION public.validate_profile_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validate display_name length and format
  IF NEW.display_name IS NOT NULL THEN
    IF LENGTH(NEW.display_name) < 2 OR LENGTH(NEW.display_name) > 50 THEN
      RAISE EXCEPTION 'Display name must be between 2 and 50 characters';
    END IF;
    
    IF NEW.display_name !~ '^[a-zA-Z0-9_\-\s]+$' THEN
      RAISE EXCEPTION 'Display name can only contain letters, numbers, spaces, hyphens, and underscores';
    END IF;
  END IF;
  
  -- Validate mobile number format (Indian mobile numbers)
  IF NEW.mobile_number IS NOT NULL THEN
    IF NEW.mobile_number !~ '^\+?[6-9]\d{9}$' THEN
      RAISE EXCEPTION 'Invalid mobile number format';
    END IF;
  END IF;
  
  -- Validate bio length
  IF NEW.bio IS NOT NULL AND LENGTH(NEW.bio) > 500 THEN
    RAISE EXCEPTION 'Bio cannot exceed 500 characters';
  END IF;
  
  -- Validate full_name length
  IF NEW.full_name IS NOT NULL AND (LENGTH(NEW.full_name) < 2 OR LENGTH(NEW.full_name) > 100) THEN
    RAISE EXCEPTION 'Full name must be between 2 and 100 characters';
  END IF;
  
  -- Validate room_number format
  IF NEW.room_number IS NOT NULL AND NEW.room_number !~ '^[A-Z0-9\-]{1,10}$' THEN
    RAISE EXCEPTION 'Invalid room number format';
  END IF;
  
  -- Validate hostel_name length
  IF NEW.hostel_name IS NOT NULL AND (LENGTH(NEW.hostel_name) < 2 OR LENGTH(NEW.hostel_name) > 50) THEN
    RAISE EXCEPTION 'Hostel name must be between 2 and 50 characters';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for profile validation
CREATE TRIGGER validate_profile_data
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_profile_data();

-- Create rate limiting table for OTP requests
CREATE TABLE public.otp_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on rate limits (public access for validation)
ALTER TABLE public.otp_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can check rate limits" 
ON public.otp_rate_limits 
FOR ALL 
USING (true);

-- Create function to check and update rate limits
CREATE OR REPLACE FUNCTION public.check_otp_rate_limit(user_email TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  current_count INTEGER;
  window_start TIMESTAMP WITH TIME ZONE;
  rate_limit_exceeded BOOLEAN := FALSE;
BEGIN
  -- Clean up old entries (older than 1 hour)
  DELETE FROM public.otp_rate_limits 
  WHERE window_start < (now() - INTERVAL '1 hour');
  
  -- Check current rate limit for this email
  SELECT request_count, otp_rate_limits.window_start 
  INTO current_count, window_start
  FROM public.otp_rate_limits 
  WHERE email = user_email 
  AND window_start > (now() - INTERVAL '1 hour')
  ORDER BY window_start DESC 
  LIMIT 1;
  
  -- If no recent requests, allow and create new record
  IF current_count IS NULL THEN
    INSERT INTO public.otp_rate_limits (email, request_count) 
    VALUES (user_email, 1);
    RETURN TRUE;
  END IF;
  
  -- If within 1 hour window and less than 5 requests, increment
  IF current_count < 5 THEN
    UPDATE public.otp_rate_limits 
    SET request_count = request_count + 1 
    WHERE email = user_email 
    AND otp_rate_limits.window_start = window_start;
    RETURN TRUE;
  END IF;
  
  -- Rate limit exceeded
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;