-- Fix INSERT policy for subscribers table to be more restrictive
-- This addresses the security scanner finding about exposed sensitive data

-- Drop the overly permissive INSERT policy
DROP POLICY IF EXISTS "insert_subscription" ON public.subscribers;

-- Create a more secure INSERT policy that only allows Edge Functions to insert
-- Edge Functions use the service role key which bypasses RLS
-- This prevents unauthorized users from creating fake subscription records
CREATE POLICY "edge_functions_can_insert_subscriptions" ON public.subscribers
FOR INSERT
WITH CHECK (false); -- No regular users can insert, only service role (Edge Functions)

-- Add a comment explaining the security model
COMMENT ON POLICY "edge_functions_can_insert_subscriptions" ON public.subscribers IS 
'Only Edge Functions with service role key can insert subscription records. This prevents unauthorized creation of fake subscription data.';