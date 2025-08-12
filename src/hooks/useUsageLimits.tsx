import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSubscription } from './useSubscription';
import { useAuth } from './useAuth';

interface UsageLimits {
  tier: string;
  max_instances: number;
  max_messages_per_month: number;
  max_webhooks: number;
}

interface UsageData {
  instances_created: number;
  messages_sent: number;
  webhooks_created: number;
  month: string;
}

interface UsageLimitsData {
  limits: UsageLimits | null;
  usage: UsageData | null;
  loading: boolean;
  error: string | null;
  canCreateInstance: boolean;
  canSendMessage: boolean;
  canCreateWebhook: boolean;
  refreshUsage: () => Promise<void>;
}

export const useUsageLimits = (): UsageLimitsData => {
  const { user } = useAuth();
  const { subscription_tier, subscribed } = useSubscription();
  const [limits, setLimits] = useState<UsageLimits | null>(null);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
  const userTier = subscribed ? subscription_tier || 'Basic' : 'free';

  const refreshUsage = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Get subscription limits for current tier
      const { data: limitsData, error: limitsError } = await supabase
        .from('subscription_limits')
        .select('*')
        .eq('tier', userTier)
        .maybeSingle();

      if (limitsError) {
        throw new Error(`Erro ao buscar limites: ${limitsError.message}`);
      }

      setLimits(limitsData);

      // Get current month usage
      const { data: usageData, error: usageError } = await supabase
        .from('usage_tracking')
        .select('*')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .maybeSingle();

      if (usageError && usageError.code !== 'PGRST116') {
        throw new Error(`Erro ao buscar uso: ${usageError.message}`);
      }

      // If no usage record exists, create default
      if (!usageData) {
        const { data: newUsage, error: createError } = await supabase
          .from('usage_tracking')
          .insert({
            user_id: user.id,
            month: currentMonth,
            instances_created: 0,
            messages_sent: 0,
            webhooks_created: 0
          })
          .select()
          .single();

        if (createError) {
          throw new Error(`Erro ao criar registro de uso: ${createError.message}`);
        }

        setUsage(newUsage);
      } else {
        setUsage(usageData);
      }

    } catch (err) {
      console.error('Error fetching usage limits:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && userTier) {
      refreshUsage();
    }
  }, [user, userTier, currentMonth]);

  // Calculate permissions
  const canCreateInstance = limits && usage ? 
    usage.instances_created < limits.max_instances : false;
  
  const canSendMessage = limits && usage ? 
    usage.messages_sent < limits.max_messages_per_month : false;
  
  const canCreateWebhook = limits && usage ? 
    usage.webhooks_created < limits.max_webhooks : false;

  return {
    limits,
    usage,
    loading,
    error,
    canCreateInstance,
    canSendMessage,
    canCreateWebhook,
    refreshUsage
  };
};