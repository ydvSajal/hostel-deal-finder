import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
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

const Chat = () => {
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { toast } = useToast();

  const listingId = searchParams.get('listing_id');

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      if (!user) {
        setLoading(false);
        return;
      }

      if (listingId) {
        await startOrGetConversation(listingId);
      } else {
        setLoading(false);
      }
    };

    getUser();
  }, [listingId]);

  const startOrGetConversation = async (listingId: string) => {
    try {
      const { data, error } = await supabase.rpc('start_conversation', {
        p_listing_id: listingId
      });

      if (error) throw error;

      await loadConversation(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const loadConversation = async (conversationId: string) => {
    try {
      // Get conversation details with listing info
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select(`
          *,
          listing:listings(title, price, seller_id)
        `)
        .eq('id', conversationId)
        .single();

      if (convError) throw convError;

      setConversation(convData);

      // Load messages
      const { data: messagesData, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (msgError) throw msgError;

      setMessages(messagesData || []);

      // Subscribe to new messages
      const channel = supabase
        .channel(`messages:${conversationId}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        }, (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
        })
        .subscribe();

      setLoading(false);

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (error: any) {
      toast({
        title: "Error loading conversation",
        description: error.message,
        variant: "destructive"
      });
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !conversation || !currentUser) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: currentUser.id,
          content: messageInput.trim()
        });

      if (error) throw error;

      setMessageInput("");
    } catch (error: any) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>Chat — BU_Basket</title>
          <meta name="description" content="Private messaging between buyers and sellers on BU_Basket." />
        </Helmet>
        <Navbar />
        <main className="mx-auto flex h-[calc(100vh-8rem)] max-w-4xl flex-col items-center justify-center px-4">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Please log in to access the chat feature.</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (!listingId) {
    return <Navigate to="/listings" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>Chat — BU_Basket</title>
        </Helmet>
        <Navbar />
        <main className="mx-auto flex h-[calc(100vh-8rem)] max-w-4xl flex-col items-center justify-center px-4">
          <p>Loading conversation...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Chat — BU_Basket</title>
        <meta name="description" content="Private messaging between buyers and sellers on BU_Basket." />
        <link rel="canonical" href="/chat" />
      </Helmet>
      <Navbar />
      <main className="mx-auto flex h-[calc(100vh-8rem)] max-w-4xl flex-col px-4 py-6">
        {conversation?.listing && (
          <div className="mb-4 rounded-xl border bg-card p-4 shadow-sm">
            <h1 className="text-lg font-semibold">{conversation.listing.title}</h1>
            <p className="text-sm text-muted-foreground">₹{conversation.listing.price} • Chat with {currentUser.id === conversation.seller_id ? 'buyer' : 'seller'}</p>
          </div>
        )}
        <div className="flex-1 space-y-3 overflow-y-auto rounded-xl border bg-card p-4">
          {messages.map((message) => {
            const isMe = message.sender_id === currentUser.id;
            return (
              <div key={message.id} className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${isMe ? "ml-auto bg-gradient-to-r from-[hsl(var(--brand))] to-[hsl(var(--brand-2))] text-white" : "bg-secondary"}`}>
                {message.content}
              </div>
            );
          })}
        </div>
        <form onSubmit={sendMessage} className="mt-3 flex gap-2">
          <Input
            className="flex-1"
            placeholder="Write a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
          />
          <Button type="submit" className="bg-gradient-to-r from-[hsl(var(--brand))] to-[hsl(var(--brand-2))] text-white hover:shadow-glow transition-all duration-300">Send</Button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default Chat;
