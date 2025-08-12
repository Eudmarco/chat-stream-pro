import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface SubscriptionData {
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
  loading: boolean;
  error?: string;
}

export const useSubscription = () => {
  const { session } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData>({
    subscribed: false,
    loading: true
  });

  const checkSubscription = async () => {
    if (!session) {
      setSubscription({ subscribed: false, loading: false });
      return;
    }

    try {
      setSubscription(prev => ({ ...prev, loading: true, error: undefined }));
      
      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      setSubscription({
        subscribed: data.subscribed || false,
        subscription_tier: data.subscription_tier,
        subscription_end: data.subscription_end,
        loading: false
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      setSubscription({
        subscribed: false,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  const createCheckout = async (plan: string) => {
    if (!session) throw new Error('User not authenticated');

    const { data, error } = await supabase.functions.invoke('create-checkout', {
      body: { plan },
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;
    return data;
  };

  const openCustomerPortal = async () => {
    if (!session) throw new Error('User not authenticated');

    const { data, error } = await supabase.functions.invoke('customer-portal', {
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) throw error;
    window.open(data.url, '_blank');
  };

  useEffect(() => {
    checkSubscription();
  }, [session]);

  return {
    ...subscription,
    checkSubscription,
    createCheckout,
    openCustomerPortal
  };
};