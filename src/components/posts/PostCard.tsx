import { useState } from 'react';
import { Post as PostType } from '@/types/database';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Heart, MessageCircle, Share2, Lock, DollarSign, MoreHorizontal, Trash2, Unlock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { usePPVPurchases } from '@/hooks/usePPVPurchases';
import { PPVPurchaseDialog } from './PPVPurchaseDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface PostCardProps {
  post: PostType;
  onDelete?: (postId: string) => void;
  onTip?: (creatorId: string) => void;
}

export function PostCard({ post, onDelete, onTip }: PostCardProps) {
  const { profile } = useAuth();
  const { isSubscribedTo, subscribe } = useSubscriptions();
  const { hasPurchased, purchasePost, purchasing } = usePPVPurchases();
  const [ppvDialogOpen, setPpvDialogOpen] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  
  const creator = post.creator;
  const isOwner = profile?.id === post.creator_id;
  const isSubscribed = isSubscribedTo(post.creator_id);
  const hasPPVAccess = hasPurchased(post.id);
  
  // Access logic:
  // - Owner always has access
  // - Public posts: everyone has access
  // - Subscriber-only (not PPV): subscribers have access
  // - PPV posts: need to purchase OR be owner
  const isPPVPost = post.is_ppv && post.ppv_price;
  const isSubscriberOnly = !post.is_public && !isPPVPost;
  
  const hasAccess = isOwner || 
    post.is_public || 
    (isSubscriberOnly && isSubscribed) ||
    (isPPVPost && hasPPVAccess);

  const handleSubscribe = async () => {
    setSubscribing(true);
    await subscribe(post.creator_id);
    setSubscribing(false);
  };

  const handlePPVPurchase = async () => {
    if (post.ppv_price) {
      await purchasePost(post.id, post.ppv_price, post.creator_id);
    }
  };

  return (
    <>
      <Card className="overflow-hidden animate-fade-in">
        <CardHeader className="flex flex-row items-center gap-3 p-4">
          <Link to={`/creator/${creator?.username || creator?.id}`}>
            <Avatar className="h-10 w-10">
              <AvatarImage src={creator?.avatar_url || undefined} />
              <AvatarFallback className="gradient-primary text-primary-foreground">
                {creator?.display_name?.charAt(0) || creator?.username?.charAt(0) || 'C'}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Link 
                to={`/creator/${creator?.username || creator?.id}`}
                className="font-semibold hover:underline"
              >
                {creator?.display_name || creator?.username}
              </Link>
              {isPPVPost && (
                <Badge variant="secondary" className="text-xs">
                  <DollarSign className="h-3 w-3 mr-0.5" />
                  PPV
                </Badge>
              )}
              {isSubscriberOnly && (
                <Badge variant="outline" className="text-xs">
                  <Lock className="h-3 w-3 mr-0.5" />
                  Subscribers
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              @{creator?.username} · {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>
          {isOwner && onDelete && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => onDelete(post.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </CardHeader>

        <CardContent className="px-4 pb-4">
          {hasAccess ? (
            <>
              {post.content && (
                <p className="mb-4 whitespace-pre-wrap">{post.content}</p>
              )}
              {post.post_media && post.post_media.length > 0 && (
                <div className="grid gap-2 rounded-lg overflow-hidden">
                  {post.post_media.map((media) => (
                    <div key={media.id} className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                      {media.media_type === 'image' ? (
                        <img 
                          src={media.media_url} 
                          alt="Post media" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <video 
                          src={media.media_url} 
                          controls 
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
              {/* Show unlocked badge for purchased PPV content */}
              {isPPVPost && hasPPVAccess && !isOwner && (
                <div className="mt-3 flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <Unlock className="h-4 w-4" />
                  <span>Purchased · Lifetime access</span>
                </div>
              )}
            </>
          ) : (
            <div 
              className="relative aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-lg flex flex-col items-center justify-center text-center p-6 cursor-pointer group"
              onClick={() => isPPVPost ? setPpvDialogOpen(true) : undefined}
            >
              <div className="absolute inset-0 backdrop-blur-xl rounded-lg" />
              {/* Blurred preview hint */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/40 to-transparent rounded-lg" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
                {isPPVPost ? (
                  <>
                    <p className="font-semibold mb-2">Pay-Per-View Content</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Unlock this exclusive content for a one-time payment
                    </p>
                    <Button 
                      className="gradient-primary group-hover:scale-105 transition-transform"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPpvDialogOpen(true);
                      }}
                    >
                      <DollarSign className="h-4 w-4 mr-2" />
                      Unlock for ${post.ppv_price?.toFixed(2)}
                    </Button>
                  </>
                ) : (
                  <>
                    <p className="font-semibold mb-2">Subscriber Only Content</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Subscribe to {creator?.display_name || creator?.username} to unlock
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        className="gradient-primary"
                        onClick={handleSubscribe}
                        disabled={subscribing}
                      >
                        {subscribing ? 'Subscribing...' : `Subscribe for $${creator?.subscription_price}/mo`}
                      </Button>
                      <Button variant="outline" asChild>
                        <Link to={`/creator/${creator?.username || creator?.id}`}>
                          View Profile
                        </Link>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="px-4 pb-4 pt-0 flex items-center gap-1">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Heart className="h-4 w-4 mr-1" />
            Like
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <MessageCircle className="h-4 w-4 mr-1" />
            Comment
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Share2 className="h-4 w-4 mr-1" />
            Share
          </Button>
          {!isOwner && onTip && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="ml-auto text-primary"
              onClick={() => onTip(post.creator_id)}
            >
              <DollarSign className="h-4 w-4 mr-1" />
              Tip
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* PPV Purchase Dialog */}
      <PPVPurchaseDialog
        open={ppvDialogOpen}
        onOpenChange={setPpvDialogOpen}
        postId={post.id}
        price={post.ppv_price || 0}
        creator={creator}
        onPurchase={handlePPVPurchase}
        purchasing={purchasing}
      />
    </>
  );
}