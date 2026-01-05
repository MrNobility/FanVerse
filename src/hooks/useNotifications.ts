import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Notification } from '@/types/database';

export function useNotifications() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!profile) return;
    
    setLoading(true);
    
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(50);
    
    const notifs = (data || []) as Notification[];
    setNotifications(notifs);
    setUnreadCount(notifs.filter(n => !n.is_read).length);
    setLoading(false);
  };

  useEffect(() => {
    if (profile) {
      fetchNotifications();
      
      // Subscribe to new notifications
      const channel = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'notifications',
            filter: `user_id=eq.${profile.id}`
          },
          () => {
            fetchNotifications();
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [profile]);

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    
    await fetchNotifications();
  };

  const markAllAsRead = async () => {
    if (!profile) return;
    
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', profile.id);
    
    await fetchNotifications();
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications
  };
}