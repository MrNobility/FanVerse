import { MainLayout } from '@/components/layout/MainLayout';
import { useNotifications } from '@/hooks/useNotifications';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, MessageCircle, DollarSign, Users, FileText, CheckCheck } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const notificationIcons = {
  new_post: FileText,
  new_message: MessageCircle,
  new_subscription: Users,
  tip_received: DollarSign,
  ppv_purchased: DollarSign,
};

export default function Notifications() {
  const { notifications, loading, markAsRead, markAllAsRead, unreadCount } = useNotifications();

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-display font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead}>
              <CheckCheck className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="font-semibold mb-2">No notifications yet</p>
            <p className="text-sm">You'll see notifications here when something happens</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(notification => {
              const Icon = notificationIcons[notification.type] || Bell;
              
              return (
                <Card
                  key={notification.id}
                  className={cn(
                    "p-4 flex items-start gap-4 cursor-pointer transition-colors hover:bg-secondary/50",
                    !notification.is_read && "bg-primary/5 border-primary/20"
                  )}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className={cn(
                    "p-2 rounded-full",
                    !notification.is_read ? "gradient-primary" : "bg-secondary"
                  )}>
                    <Icon className={cn(
                      "h-4 w-4",
                      !notification.is_read ? "text-primary-foreground" : "text-muted-foreground"
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "font-medium",
                      !notification.is_read && "text-foreground"
                    )}>
                      {notification.title}
                    </p>
                    {notification.message && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
}