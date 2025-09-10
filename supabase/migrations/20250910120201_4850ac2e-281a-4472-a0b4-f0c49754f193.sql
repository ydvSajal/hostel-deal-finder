-- Clear any existing rate limit records that might be causing issues
DELETE FROM public.otp_rate_limits;