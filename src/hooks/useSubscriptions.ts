import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Subscription, Profile } from '@/types/database';
import { toast } from 'sonner';

export function useSubscriptions() {
  const { profile } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [subscribers, setSubscribers] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = async () => {
    if (!profile) return;
    
    setLoading(true);
    
    const { data: subs } = await supabase
      .from('subscriptions')
      .select(`
        *,
        creator:profiles!subscriptions_creator_id_fkey(*)
      `)
      .eq('fan_id', profile.id)
      .eq('status', 'active');
    
    const { data: fans } = await supabase
      .from('subscriptions')
      .select(`
        *,
        fan:profiles!subscriptions_fan_id_fkey(*)
      `)
      .eq('creator_id', profile.id)
      .eq('status', 'active');
    
    setSubscriptions((subs || []) as Subscription[]);
    setSubscribers((fans || []) as Subscription[]);
    setLoading(false);
  };

  useEffect(() => {
    if (profile) {
      fetchSubscriptions();
    }
  }, [profile]);

  const isSubscribedTo = (creatorId: string): boolean => {
    return subscriptions.some(sub => sub.creator_id === creatorId && sub.status === 'active');
  };

  const subscribe = async (creatorId: string, _stripePaymentId?: string) => {
    if (!profile) return { error: new Error('Not authenticated') };
    
    // For MVP, we'll create a subscription record directly
    // In production, this would be handled by Stripe webhook
    const { error } = await supabase
      .from('subscriptions')
      .insert({
        fan_id: profile.id,
        creator_id: creatorId,
        status: 'active',
        current_period_start: new Date().toISOString(),
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });
    
    if (error) {
      if (error.code === '23505') {
        toast.info('Already subscribed');
        return { error: null };
      }
      toast.error('Failed to subscribe');
      return { error };
    }
    
    await fetchSubscriptions();
    toast.success('Subscribed successfully!');
    return { error: null };
  };

  const unsubscribe = async (creatorId: string) => {
    if (!profile) return { error: new Error('Not authenticated') };
    
    const { error } = await supabase
      .from('subscriptions')
      .update({ status: 'canceled' })
      .eq('fan_id', profile.id)
      .eq('creator_id', creatorId);
    
    if (error) {
      toast.error('Failed to unsubscribe');
      return { error };
    }
    
    await fetchSubscriptions();
    toast.success('Unsubscribed');
    return { error: null };
  };

  return {
    subscriptions,
    subscribers,
    loading,
    isSubscribedTo,
    subscribe,
    unsubscribe,
    refreshSubscriptions: fetchSubscriptions
  };
}