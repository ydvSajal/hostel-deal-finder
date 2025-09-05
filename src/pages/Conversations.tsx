import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface ConversationWithDetails {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
  listing: {
    title: string;
    price: number;
    image_url: string;
  };
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unread_count: number;
  other_user_name: string;
}

const Conversations = () => {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      if (!user) {
        setLoading(false);
        return;
      }

      await loadConversations(user.id);
    };

    loadData();
  }, []);

  const loadConversations = async (userId: string) => {
    try {
      // Get all conversations for the current user
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select(`
          *,
          listing:listings(title, price, image_url)
        `)
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order('updated_at', { ascending: false });

      if (convError) throw convError;

      // For each conversation, get the last message and other user info
      const conversationsWithDetails = await Promise.all(
        (convData || []).map(async (conv) => {
          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, created_at, sender_id')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Get unread count (messages from other user)
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', userId);

          // Get other user's display name
          const otherUserId = conv.buyer_id === userId ? conv.seller_id : conv.buyer_id;
          const { data: otherUserData } = await supabase
            .from('profiles')
            .select('display_name')
            .eq('id', otherUserId)
            .single();

          return {
            id: conv.id,
            listing_id: conv.listing_id,
            buyer_id: conv.buyer_id,
            seller_id: conv.seller_id,
            created_at: conv.created_at,
            updated_at: conv.updated_at,
            listing: {
              title: conv.listing?.title || 'Unknown Item',
              price: conv.listing?.price || 0,
              image_url: conv.listing?.image_url || ''
            },
            last_message: lastMessage ? {
              content: lastMessage.content,
              created_at: lastMessage.created_at,
              sender_id: lastMessage.sender_id
            } : undefined,
            unread_count: unreadCount || 0,
            other_user_name: otherUserData?.display_name || 'Anonymous User'
          };
        })
      );

      setConversations(conversationsWithDetails);
    } catch (error: unknown) {
      toast({
        title: "Error loading conversations",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>Conversations — BU_Basket</title>
        </Helmet>
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 py-10">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Please log in to view your conversations.</p>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>Conversations — BU_Basket</title>
        </Helmet>
        <Navbar />
        <main className="mx-auto max-w-4xl px-4 py-10">
          <p>Loading conversations...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Conversations — BU_Basket</title>
        <meta name="description" content="View and manage your conversations on BU_Basket." />
        <link rel="canonical" href="/conversations" />
      </Helmet>
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="mb-6 text-3xl font-bold">Your Conversations</h1>
        
        {conversations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No conversations yet.</p>
            <p className="text-sm text-muted-foreground">
              Start chatting by visiting a <Link to="/listings" className="text-primary underline">listing</Link> and clicking "Chat with seller".
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => {
              const isSellerView = conversation.seller_id === currentUser.id;
              const otherUserRole = isSellerView ? 'Buyer' : 'Seller';
              
              return (
                <Card 
                  key={conversation.id} 
                  className="hover:shadow-lg transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/chat?listing_id=${conversation.listing_id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={conversation.listing.image_url || "/placeholder.svg"}
                        alt={conversation.listing.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg truncate">
                              {conversation.listing.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {otherUserRole}: {conversation.other_user_name} • ₹{conversation.listing.price}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {conversation.unread_count > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {conversation.unread_count}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                        {conversation.last_message && (
                          <div className="mt-2">
                            <p className="text-sm text-muted-foreground truncate">
                              {conversation.last_message.sender_id === currentUser.id ? 'You: ' : ''}
                              {conversation.last_message.content}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Conversations;