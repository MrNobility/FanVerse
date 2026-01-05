import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Transaction } from '@/types/database';

interface EarningsStats {
  totalEarnings: number;
  subscriptionEarnings: number;
  tipEarnings: number;
  ppvEarnings: number;
  subscriberCount: number;
  monthlyEarnings: number;
}

export function useEarnings() {
  const { profile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<EarningsStats>({
    totalEarnings: 0,
    subscriptionEarnings: 0,
    tipEarnings: 0,
    ppvEarnings: 0,
    subscriberCount: 0,
    monthlyEarnings: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchEarnings = async () => {
    if (!profile) return;
    
    setLoading(true);
    
    // Fetch transactions
    const { data: txns } = await supabase
      .from('transactions')
      .select(`
        *,
        fan:profiles!transactions_fan_id_fkey(*)
      `)
      .eq('creator_id', profile.id)
      .order('created_at', { ascending: false });
    
    setTransactions((txns || []) as Transaction[]);
    
    // Calculate stats
    const allTxns = txns || [];
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const totalEarnings = allTxns.reduce((sum, t) => sum + Number(t.net_amount), 0);
    const subscriptionEarnings = allTxns.filter(t => t.type === 'subscription').reduce((sum, t) => sum + Number(t.net_amount), 0);
    const tipEarnings = allTxns.filter(t => t.type === 'tip').reduce((sum, t) => sum + Number(t.net_amount), 0);
    const ppvEarnings = allTxns.filter(t => t.type === 'ppv').reduce((sum, t) => sum + Number(t.net_amount), 0);
    const monthlyEarnings = allTxns
      .filter(t => new Date(t.created_at) >= startOfMonth)
      .reduce((sum, t) => sum + Number(t.net_amount), 0);
    
    // Get subscriber count
    const { count } = await supabase
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', profile.id)
      .eq('status', 'active');
    
    setStats({
      totalEarnings,
      subscriptionEarnings,
      tipEarnings,
      ppvEarnings,
      subscriberCount: count || 0,
      monthlyEarnings
    });
    
    setLoading(false);
  };

  useEffect(() => {
    if (profile) {
      fetchEarnings();
    }
  }, [profile]);

  return {
    transactions,
    stats,
    loading,
    refreshEarnings: fetchEarnings
  };
}