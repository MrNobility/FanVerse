import { Profile } from '@/types/database';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface CreatorCardProps {
  creator: Profile;
  showSubscribeButton?: boolean;
  isSubscribed?: boolean;
  onSubscribe?: () => void;
}

export function CreatorCard({ creator, showSubscribeButton = true, isSubscribed = false, onSubscribe }: CreatorCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Banner */}
      <div className="h-24 bg-gradient-to-r from-primary to-accent relative">
        {creator.banner_url && (
          <img 
            src={creator.banner_url} 
            alt="" 
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {/* Content */}
      <div className="p-4 pt-0">
        <div className="flex items-end gap-4 -mt-8 mb-3">
          <Link to={`/creator/${creator.username || creator.id}`}>
            <Avatar className="h-16 w-16 border-4 border-card">
              <AvatarImage src={creator.avatar_url || undefined} />
              <AvatarFallback className="gradient-primary text-primary-foreground text-xl">
                {creator.display_name?.charAt(0) || creator.username?.charAt(0) || 'C'}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>

        <div className="mb-3">
          <Link 
            to={`/creator/${creator.username || creator.id}`}
            className="flex items-center gap-1 hover:underline"
          >
            <span className="font-semibold">{creator.display_name || creator.username}</span>
            {creator.is_creator_verified && (
              <CheckCircle className="h-4 w-4 text-primary fill-primary" />
            )}
          </Link>
          <p className="text-sm text-muted-foreground">@{creator.username}</p>
        </div>

        {creator.bio && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {creator.bio}
          </p>
        )}

        {showSubscribeButton && (
          <div className="flex items-center justify-between">
            <Badge variant="secondary" className="font-semibold">
              ${creator.subscription_price}/mo
            </Badge>
            {isSubscribed ? (
              <Button variant="outline" size="sm" disabled>
                Subscribed
              </Button>
            ) : (
              <Button 
                size="sm" 
                className="gradient-primary"
                onClick={onSubscribe}
              >
                Subscribe
              </Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}