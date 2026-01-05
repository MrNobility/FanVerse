import { Post as PostType } from '@/types/database';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Heart, MessageCircle, Share2, Lock, DollarSign, MoreHorizontal, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface PostCardProps {
  post: PostType;
  onDelete?: (postId: string) => void;
  onTip?: (creatorId: string) => void;
}

export function PostCard({ post, onDelete, onTip }: PostCardProps) {
  const { profile } = useAuth();
  const { isSubscribedTo } = useSubscriptions();
  
  const creator = post.creator;
  const isOwner = profile?.id === post.creator_id;
  const hasAccess = post.is_public || isSubscribedTo(post.creator_id) || isOwner;
  const isPPVLocked = post.is_ppv && !isOwner; // Add PPV purchase check later

  return (
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
          <Link 
            to={`/creator/${creator?.username || creator?.id}`}
            className="font-semibold hover:underline"
          >
            {creator?.display_name || creator?.username}
          </Link>
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
        {hasAccess && !isPPVLocked ? (
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
          </>
        ) : (
          <div className="relative aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-lg flex flex-col items-center justify-center text-center p-6">
            <div className="absolute inset-0 backdrop-blur-xl" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 mx-auto">
                <Lock className="h-8 w-8 text-primary" />
              </div>
              {isPPVLocked ? (
                <>
                  <p className="font-semibold mb-2">Pay-Per-View Content</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Unlock this post for ${post.ppv_price}
                  </p>
                  <Button className="gradient-primary">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Unlock for ${post.ppv_price}
                  </Button>
                </>
              ) : (
                <>
                  <p className="font-semibold mb-2">Subscriber Only</p>
                  <p className="text-sm text-muted-foreground mb-4">
                    Subscribe to see this content
                  </p>
                  <Button className="gradient-primary" asChild>
                    <Link to={`/creator/${creator?.username || creator?.id}`}>
                      Subscribe for ${creator?.subscription_price}/mo
                    </Link>
                  </Button>
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
  );
}