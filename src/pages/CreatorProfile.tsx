import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Profile, Post } from '@/types/database';
import { MainLayout } from '@/components/layout/MainLayout';
import { PostCard } from '@/components/posts/PostCard';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle, MessageCircle, Grid3X3, Lock, Settings, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { usePosts } from '@/hooks/usePosts';
import { Link } from 'react-router-dom';

export default function CreatorProfile() {
  const { username } = useParams<{ username: string }>();
  const { profile: currentProfile } = useAuth();
  const [creator, setCreator] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { isSubscribedTo, subscribe } = useSubscriptions();
  const { posts, deletePost, loading: postsLoading } = usePosts(creator?.id);

  const isOwn = currentProfile?.id === creator?.id || currentProfile?.username === username;
  const isSubscribed = creator ? isSubscribedTo(creator.id) : false;

  useEffect(() => {
    const fetchCreator = async () => {
      setLoading(true);
      
      // Try by username first, then by id
      let { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();
      
      if (!data) {
        const { data: byId } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', username)
          .single();
        data = byId;
      }
      
      setCreator(data as Profile | null);
      setLoading(false);
    };

    if (username) {
      fetchCreator();
    }
  }, [username]);

  const handleSubscribe = async () => {
    if (creator) {
      await subscribe(creator.id);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="space-y-4">
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-20 w-20 rounded-full -mt-10 ml-4" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
      </MainLayout>
    );
  }

  if (!creator) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-display font-bold mb-2">Creator not found</h1>
          <p className="text-muted-foreground">This profile doesn't exist or has been removed.</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Banner */}
        <div className="relative h-48 md:h-64 rounded-xl overflow-hidden bg-gradient-to-r from-primary to-accent">
          {creator.banner_url && (
            <img 
              src={creator.banner_url} 
              alt="" 
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Profile Info */}
        <div className="relative px-4">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background -mt-16 md:-mt-20">
              <AvatarImage src={creator.avatar_url || undefined} />
              <AvatarFallback className="gradient-primary text-primary-foreground text-3xl">
                {creator.display_name?.charAt(0) || creator.username?.charAt(0) || 'C'}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-display font-bold">
                  {creator.display_name || creator.username}
                </h1>
                {creator.is_creator_verified && (
                  <CheckCircle className="h-5 w-5 text-primary fill-primary" />
                )}
              </div>
              <p className="text-muted-foreground">@{creator.username}</p>
            </div>

            <div className="flex gap-2">
              {isOwn ? (
                <Button variant="outline" asChild>
                  <Link to="/settings">
                    <Settings className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="outline" size="icon">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <DollarSign className="h-4 w-4" />
                  </Button>
                  {isSubscribed ? (
                    <Button variant="secondary">Subscribed</Button>
                  ) : (
                    <Button className="gradient-primary" onClick={handleSubscribe}>
                      Subscribe ${creator.subscription_price}/mo
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>

          {creator.bio && (
            <p className="mt-4 text-foreground">{creator.bio}</p>
          )}

          <div className="flex gap-4 mt-4">
            <Badge variant="secondary" className="px-3 py-1">
              {posts.length} Posts
            </Badge>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="posts" className="gap-2">
              <Grid3X3 className="h-4 w-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="locked" className="gap-2">
              <Lock className="h-4 w-4" />
              Locked
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="mt-6 space-y-4">
            {postsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-64 w-full rounded-xl" />
                ))}
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No posts yet
              </div>
            ) : (
              posts.map(post => (
                <PostCard 
                  key={post.id} 
                  post={post}
                  onDelete={isOwn ? deletePost : undefined}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="locked" className="mt-6">
            <div className="text-center py-12 text-muted-foreground">
              {isSubscribed || isOwn ? (
                'No locked content'
              ) : (
                <>
                  <Lock className="h-12 w-12 mx-auto mb-4 text-primary" />
                  <p className="font-semibold mb-2">Subscribe to unlock</p>
                  <p className="text-sm mb-4">Get access to exclusive content</p>
                  <Button className="gradient-primary" onClick={handleSubscribe}>
                    Subscribe ${creator.subscription_price}/mo
                  </Button>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}