import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Conversation, Message } from '@/types/database';
import { toast } from 'sonner';

export function useMessages() {
  const { profile } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    if (!profile) return;
    
    setLoading(true);
    
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant_1:profiles!conversations_participant_1_id_fkey(*),
        participant_2:profiles!conversations_participant_2_id_fkey(*)
      `)
      .or(`participant_1_id.eq.${profile.id},participant_2_id.eq.${profile.id}`)
      .order('last_message_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching conversations:', error);
    } else {
      setConversations((data || []) as Conversation[]);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    if (profile) {
      fetchConversations();
      
      // Subscribe to new messages
      const channel = supabase
        .channel('messages')
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          () => {
            fetchConversations();
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [profile]);

  const getOrCreateConversation = async (otherUserId: string) => {
    if (!profile) return { conversation: null, error: new Error('Not authenticated') };
    
    // Check if conversation exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('*')
      .or(
        `and(participant_1_id.eq.${profile.id},participant_2_id.eq.${otherUserId}),and(participant_1_id.eq.${otherUserId},participant_2_id.eq.${profile.id})`
      )
      .single();
    
    if (existing) {
      return { conversation: existing as Conversation, error: null };
    }
    
    // Create new conversation
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        participant_1_id: profile.id,
        participant_2_id: otherUserId
      })
      .select()
      .single();
    
    if (error) {
      toast.error('Failed to start conversation');
      return { conversation: null, error };
    }
    
    await fetchConversations();
    return { conversation: data as Conversation, error: null };
  };

  const getMessages = async (conversationId: string) => {
    const { data, error } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(*)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
    
    return (data || []) as Message[];
  };

  const sendMessage = async (conversationId: string, content: string) => {
    if (!profile) return { error: new Error('Not authenticated') };
    
    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: profile.id,
        content
      });
    
    if (error) {
      toast.error('Failed to send message');
      return { error };
    }
    
    // Update conversation last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId);
    
    return { error: null };
  };

  const markAsRead = async (conversationId: string) => {
    if (!profile) return;
    
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', profile.id);
  };

  return {
    conversations,
    loading,
    getOrCreateConversation,
    getMessages,
    sendMessage,
    markAsRead,
    refreshConversations: fetchConversations
  };
}