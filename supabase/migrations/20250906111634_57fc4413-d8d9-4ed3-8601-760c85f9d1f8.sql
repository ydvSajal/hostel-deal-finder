-- Fix security vulnerability: Restrict profile visibility to only legitimate business relationships
-- Remove the overly permissive policy that allows all authenticated users to see seller profiles
-- Keep only: own profile access + conversation participants access

DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;

-- Create new restrictive policy that only allows:
-- 1. Users to view their own profile
-- 2. Users to view profiles of people they're in active conversations with
CREATE POLICY "Users can view profiles securely" ON public.profiles
FOR SELECT 
USING (
  -- User can view their own profile
  (auth.uid() = id) 
  OR 
  -- User can view profiles of people they're in conversations with
  (id IN ( 
    SELECT
      CASE
        WHEN (conversations.buyer_id = auth.uid()) THEN conversations.seller_id
        WHEN (conversations.seller_id = auth.uid()) THEN conversations.buyer_id
        ELSE NULL::uuid
      END AS conversation_participant
    FROM conversations
    WHERE ((conversations.buyer_id = auth.uid()) OR (conversations.seller_id = auth.uid()))
  ))
);