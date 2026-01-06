import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface PPVPurchase {
  id: string;
  fan_id: string;
  post_id: string;
  amount: number;
  created_at: string;
}

export function usePPVPurchases() {
  const { profile } = useAuth();
  const [purchases, setPurchases] = useState<PPVPurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  const fetchPurchases = useCallback(async () => {
    if (!profile) {
      setLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('ppv_purchases')
      .select('*')
      .eq('fan_id', profile.id);

    if (error) {
      console.error('Error fetching PPV purchases:', error);
    } else {
      setPurchases(data || []);
    }
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const hasPurchased = useCallback((postId: string): boolean => {
    return purchases.some(p => p.post_id === postId);
  }, [purchases]);

  const purchasePost = async (postId: string, amount: number, creatorId: string) => {
    if (!profile) {
      toast.error('Please log in to purchase content');
      return { error: new Error('Not authenticated'), success: false };
    }

    setPurchasing(true);

    try {
      // Check if already purchased
      if (hasPurchased(postId)) {
        toast.info('You already own this content');
        setPurchasing(false);
        return { error: null, success: true };
      }

      // Mock payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create purchase record
      const { error: purchaseError } = await supabase
        .from('ppv_purchases')
        .insert({
          fan_id: profile.id,
          post_id: postId,
          amount: amount,
          stripe_payment_id: `mock_${Date.now()}` // Mock payment ID
        });

      if (purchaseError) {
        if (purchaseError.code === '23505') {
          toast.info('You already own this content');
          setPurchasing(false);
          return { error: null, success: true };
        }
        throw purchaseError;
      }

      // Create transaction record for creator earnings
      const platformFeePercent = 0.20; // 20% platform fee
      const platformFee = amount * platformFeePercent;
      const netAmount = amount - platformFee;

      await supabase
        .from('transactions')
        .insert({
          creator_id: creatorId,
          fan_id: profile.id,
          type: 'ppv',
          gross_amount: amount,
          platform_fee: platformFee,
          net_amount: netAmount,
          stripe_payment_id: `mock_${Date.now()}`
        });

      // Refresh purchases
      await fetchPurchases();

      toast.success('Content unlocked successfully!');
      setPurchasing(false);
      return { error: null, success: true };
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error('Failed to complete purchase. Please try again.');
      setPurchasing(false);
      return { error: error as Error, success: false };
    }
  };

  return {
    purchases,
    loading,
    purchasing,
    hasPurchased,
    purchasePost,
    refreshPurchases: fetchPurchases
  };
}
