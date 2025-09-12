-- Fix security vulnerability: Remove overly permissive RLS policy on otp_rate_limits table
-- The current policy "Anyone can check rate limits" with expression "true" allows anyone to read all email addresses

-- Drop the insecure policy that allows anyone to read all email addresses
DROP POLICY IF EXISTS "Anyone can check rate limits" ON public.otp_rate_limits;

-- Since the check_otp_rate_limit() function is SECURITY DEFINER, it can bypass RLS policies
-- and handle all necessary operations (SELECT, INSERT, UPDATE, DELETE) internally.
-- We don't need any public access policies since all legitimate access goes through the function.

-- Add a restrictive policy that prevents any direct access to the table
-- Only the SECURITY DEFINER function should be able to access this data
CREATE POLICY "No direct access to rate limits" ON public.otp_rate_limits
FOR ALL 
USING (false)
WITH CHECK (false);

-- Verify RLS is still enabled on the table
ALTER TABLE public.otp_rate_limits ENABLE ROW LEVEL SECURITY;