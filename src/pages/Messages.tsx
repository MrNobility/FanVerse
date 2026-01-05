import { useState, useEffect, useRef } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { useMessages } from '@/hooks/useMessages';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Message, Conversation } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';

export default function Messages() {
  const { profile } = useAuth();
  const { conversations, loading, getMessages, sendMessage, markAsRead } = useMessages();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getOtherParticipant = (conv: Conversation) => {
    if (!profile) return null;
    return conv.participant_1_id === profile.id ? conv.participant_2 : conv.participant_1;
  };

  useEffect(() => {
    if (selectedConversation) {
      loadMessages();
      markAsRead(selectedConversation.id);

      // Subscribe to new messages
      const channel = supabase
        .channel(`messages:${selectedConversation.id}`)
        .on(
          'postgres_changes',
          { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'messages',
            filter: `conversation_id=eq.${selectedConversation.id}`
          },
          () => {
            loadMessages();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadMessages = async () => {
    if (!selectedConversation) return;
    const msgs = await getMessages(selectedConversation.id);
    setMessages(msgs);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    setSending(true);
    await sendMessage(selectedConversation.id, newMessage.trim());
    setNewMessage('');
    await loadMessages();
    setSending(false);
  };

  return (
    <MainLayout>
      <div className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)] flex flex-col">
        <h1 className="text-2xl font-display font-bold mb-4">Messages</h1>

        <div className="flex-1 flex border border-border rounded-xl overflow-hidden bg-card">
          {/* Conversation List */}
          <div className={`w-full md:w-80 border-r border-border ${selectedConversation ? 'hidden md:block' : ''}`}>
            <ScrollArea className="h-full">
              {loading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-16 w-full rounded-lg" />
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  No conversations yet
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {conversations.map(conv => {
                    const other = getOtherParticipant(conv);
                    if (!other) return null;
                    
                    return (
                      <button
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv)}
                        className={`w-full p-4 flex items-center gap-3 hover:bg-secondary transition-colors text-left ${
                          selectedConversation?.id === conv.id ? 'bg-secondary' : ''
                        }`}
                      >
                        <Avatar>
                          <AvatarImage src={other.avatar_url || undefined} />
                          <AvatarFallback className="gradient-primary text-primary-foreground">
                            {other.display_name?.charAt(0) || other.username?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">
                            {other.display_name || other.username}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Message Thread */}
          <div className={`flex-1 flex flex-col ${!selectedConversation ? 'hidden md:flex' : ''}`}>
            {selectedConversation ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-border flex items-center gap-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => setSelectedConversation(null)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  {(() => {
                    const other = getOtherParticipant(selectedConversation);
                    return other ? (
                      <>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={other.avatar_url || undefined} />
                          <AvatarFallback className="gradient-primary text-primary-foreground">
                            {other.display_name?.charAt(0) || other.username?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">
                            {other.display_name || other.username}
                          </p>
                          <p className="text-xs text-muted-foreground">@{other.username}</p>
                        </div>
                      </>
                    ) : null;
                  })()}
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map(msg => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender_id === profile?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] px-4 py-2 rounded-2xl ${
                            msg.sender_id === profile?.id
                              ? 'gradient-primary text-primary-foreground rounded-br-sm'
                              : 'bg-secondary text-secondary-foreground rounded-bl-sm'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                {/* Input */}
                <form onSubmit={handleSend} className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={sending}
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      className="gradient-primary"
                      disabled={sending || !newMessage.trim()}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Select a conversation to start messaging
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}