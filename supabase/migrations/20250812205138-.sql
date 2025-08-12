-- Create usage limits configuration table
CREATE TABLE public.subscription_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tier TEXT NOT NULL UNIQUE,
  max_instances INTEGER NOT NULL DEFAULT 0,
  max_messages_per_month INTEGER NOT NULL DEFAULT 0,
  max_webhooks INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create usage tracking table
CREATE TABLE public.usage_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  month TEXT NOT NULL, -- format: YYYY-MM
  instances_created INTEGER NOT NULL DEFAULT 0,
  messages_sent INTEGER NOT NULL DEFAULT 0,
  webhooks_created INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, month)
);

-- Enable RLS on both tables
ALTER TABLE public.subscription_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- RLS policies for subscription_limits (read-only for users)
CREATE POLICY "Anyone can view subscription limits" 
ON public.subscription_limits 
FOR SELECT 
USING (true);

-- RLS policies for usage_tracking
CREATE POLICY "Users can view their own usage" 
ON public.usage_tracking 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own usage" 
ON public.usage_tracking 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own usage" 
ON public.usage_tracking 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Insert default subscription limits
INSERT INTO public.subscription_limits (tier, max_instances, max_messages_per_month, max_webhooks) VALUES
('free', 1, 100, 1),
('Basic', 3, 1000, 3),
('Premium', 10, 10000, 10),
('Enterprise', 50, 100000, 50);

-- Create trigger for updated_at on usage_tracking
CREATE TRIGGER update_usage_tracking_updated_at
BEFORE UPDATE ON public.usage_tracking
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_usage_tracking_user_month ON public.usage_tracking(user_id, month);
CREATE INDEX idx_subscription_limits_tier ON public.subscription_limits(tier);