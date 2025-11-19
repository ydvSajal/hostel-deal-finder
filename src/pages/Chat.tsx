import { Helmet } from "react-helmet-async";
import { useState, useEffect, useRef } from "react";
import { useSearchParams, Navigate, useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ErrorBoundary from "@/components/ErrorBoundary";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at?: string;
}

interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  listing?: {
    title: string;
    price: number;
    seller_id: string;
  };
}

const ChatContent = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const listingId = searchParams.get('listing_id');
  const conversationId = searchParams.get('conversation_id');

  const loadConversation = async (conversationId: string, userId: string) => {
    try {
      if (!conversationId || !userId) {
        throw new Error('Missing conversation ID or user ID');
      }

      setError(null);

      // Get conversation details with listing info
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select(`
          *,
          listing:listings(title, price, seller_id)
        `)
        .eq('id', conversationId)
        .maybeSingle();

      if (convError) {
        throw new Error(`Failed to load conversation: ${convError.message}`);
      }

      if (!convData) {
        throw new Error('Conversation not found');
      }

      // Check if user is participant
      if (convData.buyer_id !== userId && convData.seller_id !== userId) {
        throw new Error('Access denied: You are not a participant in this conversation');
      }

      setConversation(convData);

      // Load messages with error handling
      const { data: messagesData, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(50);

      if (msgError) {
        console.error('Messages error:', msgError);
        // Don't fail completely if messages can't load, just show empty conversation
        setMessages([]);
        toast({
          title: "Warning",
          description: "Could not load message history",
          variant: "destructive"
        });
      } else {
        setMessages(messagesData || []);
      }

      setLoading(false);
    } catch (error: unknown) {
      console.error('Load conversation error:', error);
      const errorMessage = error instanceof Error ? error.message : "Unable to load conversation";
      setError(errorMessage);
      setLoading(false);
    }
  };

  const startOrGetConversation = async (listingId: string, userId: string) => {
    try {
      if (!listingId || !userId) {
        throw new Error('Missing listing ID or user ID');
      }

      setError(null);

      // Get listing info first
      const { data: listing, error: listingError } = await supabase
        .from('listings')
        .select('*')
        .eq('id', listingId)
        .single();

      if (listingError) {
        throw new Error(`Failed to load listing: ${listingError.message}`);
      }

      if (!listing) {
        throw new Error('Listing not found');
      }

      // Check if user is trying to message their own listing
      if (listing.seller_id === userId) {
        setError("You cannot start a conversation with your own listing");
        toast({
          title: "Cannot message yourself",
          description: "Redirecting to listings...",
          variant: "destructive"
        });
        setTimeout(() => {
          navigate('/listings');
        }, 2000);
        return;
      }

      // Check for existing conversation
      const { data: existingConv, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .eq('listing_id', listingId)
        .eq('buyer_id', userId)
        .eq('seller_id', listing.seller_id)
        .maybeSingle();

      if (convError) {
        throw new Error(`Failed to check existing conversation: ${convError.message}`);
      }

      let conversationId: string;

      if (existingConv) {
        conversationId = existingConv.id;
      } else {
        // Create new conversation
        const { data: newConv, error: createError } = await supabase
          .from('conversations')
          .insert({
            listing_id: listingId,
            buyer_id: userId,
            seller_id: listing.seller_id
          })
          .select()
          .single();

        if (createError) {
          throw new Error(`Failed to create conversation: ${createError.message}`);
        }

        if (!newConv) {
          throw new Error('Failed to create conversation - no data returned');
        }

        conversationId = newConv.id;
      }

      await loadConversation(conversationId, userId);
    } catch (error: unknown) {
      console.error('Start or get conversation error:', error);
      const errorMessage = error instanceof Error ? error.message : "Unable to start conversation";
      setError(errorMessage);
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeChat = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
          throw new Error(`Authentication error: ${userError.message}`);
        }

        if (!isMounted) return;
        setCurrentUser(user);

        if (!user) {
          setLoading(false);
          return;
        }

        if (conversationId) {
          await loadConversation(conversationId, user.id);
        } else if (listingId) {
          await startOrGetConversation(listingId, user.id);
        } else {
          setError("No conversation or listing ID provided");
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing chat:', error);
        if (isMounted) {
          setError(error instanceof Error ? error.message : "Failed to initialize chat");
          setLoading(false);
        }
      }
    };

    initializeChat();

    return () => {
      isMounted = false;
    };
  }, [listingId, conversationId]);

  // Handle real-time message subscription
  useEffect(() => {
    if (!conversation?.id || !currentUser) return;

    const channel = supabase
      .channel(`messages:${conversation.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversation.id}`
      }, (payload) => {
        const newMessage = payload.new as Message;
        setMessages(prev => [...prev, newMessage]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversation?.id, currentUser?.id]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !conversation || !currentUser) return;

    const messageContent = messageInput.trim();
    setMessageInput(""); // Clear input immediately

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: currentUser.id,
          content: messageContent
        });

      if (error) throw error;

      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversation.id);

    } catch (error: unknown) {
      // Restore message input on error
      setMessageInput(messageContent);
      toast({
        title: "Error sending message",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-atmospheric relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 h-96 w-96 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>
        <Helmet>
          <title>Chat — BU_Basket</title>
          <meta name="description" content="Private messaging between buyers and sellers on BU_Basket." />
        </Helmet>
        <Navbar />
        <main className="relative mx-auto flex h-[calc(100vh-8rem)] w-full max-w-6xl flex-col items-center justify-center px-4 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border-2 border-brand/30 bg-gradient-to-br from-card/95 via-card/90 to-card/95 p-12 shadow-2xl backdrop-blur-xl text-center max-w-md">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 opacity-20 blur-3xl animate-pulse" />
            <div className="relative">
              <div className="text-6xl mb-4 animate-bounce">🔐</div>
              <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
              <p className="mb-6 text-muted-foreground">Please log in to access the chat feature.</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!listingId && !conversationId) {
    return <Navigate to="/conversations" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-atmospheric relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 h-96 w-96 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>
        <Helmet>
          <title>Chat — BU_Basket</title>
        </Helmet>
        <Navbar />
        <main className="relative mx-auto flex h-[calc(100vh-8rem)] w-full max-w-6xl flex-col items-center justify-center px-4 lg:px-8">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-brand border-t-transparent mb-4" />
            <p className="text-lg text-muted-foreground">Loading conversation...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-atmospheric relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 h-96 w-96 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 blur-3xl animate-pulse" />
        </div>
        <Helmet>
          <title>Chat — BU_Basket</title>
        </Helmet>
        <Navbar />
        <main className="relative mx-auto flex h-[calc(100vh-8rem)] w-full max-w-6xl flex-col items-center justify-center px-4 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl border-2 border-red-500/30 bg-gradient-to-br from-card/95 via-card/90 to-card/95 p-12 shadow-2xl backdrop-blur-xl text-center max-w-md">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-red-500 to-orange-500 opacity-20 blur-3xl animate-pulse" />
            <div className="relative">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold mb-4">Error loading conversation</h2>
              <p className="text-red-500 mb-6 font-medium">{error}</p>
              <Button variant="outline" className="rounded-2xl border-2" onClick={() => window.history.back()}>
                ← Back
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-atmospheric relative overflow-hidden">
      {/* Atmospheric background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 h-96 w-96 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <Helmet>
        <title>Chat — BU_Basket</title>
        <meta name="description" content="Private messaging between buyers and sellers on BU_Basket." />
        <link rel="canonical" href="/chat" />
      </Helmet>
      <Navbar />
      <main className="relative mx-auto flex h-[calc(100vh-8rem)] w-full max-w-6xl flex-col px-4 py-6 lg:px-8">
        {conversation?.listing && (
          <div className="mb-4 rounded-2xl border-2 border-brand/30 bg-gradient-to-br from-card/95 via-card/90 to-card/95 p-5 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-2xl">💼</span>
                  {conversation.listing.title}
                </h1>
                <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  <span className="font-semibold text-brand">₹{conversation.listing.price}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <span className="text-base">{currentUser.id === conversation.seller_id ? '🛒' : '🏪'}</span>
                    Chat with {currentUser.id === conversation.seller_id ? 'buyer' : 'seller'}
                  </span>
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                                className="rounded-xl border-2 hover:border-brand/50 transition-all"
                onClick={() => window.history.back()}
              >
                ← Back
              </Button>
            </div>
          </div>
        )}
        <div className="flex-1 space-y-3 overflow-y-auto rounded-2xl border-2 border-border/30 bg-gradient-to-br from-card/95 via-card/90 to-card/95 p-6 min-h-0 shadow-xl backdrop-blur-xl">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4 animate-bounce">💬</div>
              <p className="text-lg font-medium text-muted-foreground">No messages yet</p>
              <p className="text-sm text-muted-foreground mt-2">Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => {
              const isMe = message.sender_id === currentUser.id;
              const messageTime = new Date(message.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div key={message.id} className={`max-w-[80%] lg:max-w-[70%] rounded-2xl px-4 py-3 text-sm shadow-md ${isMe ? "ml-auto bg-gradient-to-r from-[hsl(var(--brand))] to-[hsl(var(--brand-2))] text-white" : "bg-gradient-to-br from-secondary to-secondary/80 border-2 border-border/20"}`}>
                  <p className="leading-relaxed">{message.content}</p>
                  <p className={`text-xs mt-2 flex items-center gap-1 ${isMe ? "text-white/70" : "text-muted-foreground"}`}>
                    <span>⏰</span>
                    {messageTime}
                  </p>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
        <form onSubmit={sendMessage} className="mt-4 flex gap-3">
          <Input
            className="flex-1 h-14 rounded-2xl border-2 border-border/50 bg-background/50 backdrop-blur-sm transition-all duration-300 focus:border-brand focus:ring-4 focus:ring-brand/20 text-base hover:border-brand/50"
            placeholder="✍️ Write a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
          />
          <Button 
            type="submit" 
            className="h-14 px-8 rounded-2xl bg-gradient-to-r from-[hsl(var(--brand))] to-[hsl(var(--brand-2))] text-white font-bold hover:scale-105 hover:shadow-glow transition-all duration-300 flex items-center gap-2"
          >
            <span>Send</span>
            <span>🚀</span>
          </Button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

const Chat = () => {
  return (
    <ErrorBoundary>
      <ChatContent />
    </ErrorBoundary>
  );
};

export default Chat;