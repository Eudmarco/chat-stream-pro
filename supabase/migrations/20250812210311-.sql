-- Fix subscribers table RLS policies - remove insecure email access
DROP POLICY IF EXISTS "select_own_subscription" ON public.subscribers;
DROP POLICY IF EXISTS "update_subscription" ON public.subscribers;

-- Create secure subscribers policies
CREATE POLICY "Users can view their own subscription" 
ON public.subscribers 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" 
ON public.subscribers 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Add DELETE policies for all tables

-- Instances DELETE policy
CREATE POLICY "Users can delete their own instances" 
ON public.instances 
FOR DELETE 
USING (auth.uid() = user_id);

-- Logs DELETE policy  
CREATE POLICY "Users can delete their own logs"
ON public.logs
FOR DELETE
USING (auth.uid() = user_id);

-- Metrics DELETE policy
CREATE POLICY "Users can delete their own metrics"
ON public.metrics
FOR DELETE
USING (auth.uid() = user_id);

-- Subscribers DELETE policy
CREATE POLICY "Users can delete their own subscription"
ON public.subscribers
FOR DELETE
USING (auth.uid() = user_id);

-- Usage tracking DELETE policy
CREATE POLICY "Users can delete their own usage tracking"
ON public.usage_tracking
FOR DELETE
USING (auth.uid() = user_id);

-- Webhooks DELETE policy
CREATE POLICY "Users can delete their own webhooks"
ON public.webhooks
FOR DELETE
USING (auth.uid() = user_id);