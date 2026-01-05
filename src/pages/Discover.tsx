import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/database';
import { MainLayout } from '@/components/layout/MainLayout';
import { CreatorCard } from '@/components/creators/CreatorCard';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search } from 'lucide-react';
import { useSubscriptions } from '@/hooks/useSubscriptions';

export default function Discover() {
  const [creators, setCreators] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { isSubscribedTo, subscribe } = useSubscriptions();

  useEffect(() => {
    const fetchCreators = async () => {
      setLoading(true);
      
      // Get all users who have the creator role
      const { data: creatorRoles } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'creator');
      
      if (!creatorRoles || creatorRoles.length === 0) {
        setCreators([]);
        setLoading(false);
        return;
      }

      const userIds = creatorRoles.map(r => r.user_id);
      
      let query = supabase
        .from('profiles')
        .select('*')
        .in('user_id', userIds);
      
      if (searchQuery) {
        query = query.or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%`);
      }
      
      const { data } = await query;
      setCreators((data || []) as Profile[]);
      setLoading(false);
    };

    fetchCreators();
  }, [searchQuery]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-display font-bold">Discover Creators</h1>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search creators..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-64 w-full rounded-xl" />
            ))}
          </div>
        ) : creators.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <p className="font-semibold mb-2">No creators found</p>
            <p className="text-sm">Be the first to become a creator!</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {creators.map(creator => (
              <CreatorCard
                key={creator.id}
                creator={creator}
                isSubscribed={isSubscribedTo(creator.id)}
                onSubscribe={() => subscribe(creator.id)}
              />
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}