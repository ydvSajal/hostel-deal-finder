import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Check, Trash2 } from "lucide-react";

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState<string | null>(null);
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

          // Get unread count (messages from other user that haven't been read)
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', userId)
            .is('read_at', null);

          // Get other user's display name
          const otherUserId = conv.buyer_id === userId ? conv.seller_id : conv.buyer_id;
          let otherUserName = 'Anonymous User';
          
          try {
            const { data: otherUserData } = await supabase.rpc('get_safe_profile', {
              profile_user_id: otherUserId,
              requesting_user_id: userId
            });
            
            if (otherUserData && otherUserData.length > 0) {
              otherUserName = otherUserData[0].display_name || 'Anonymous User';
            }
          } catch (error) {
            console.warn('Failed to fetch user profile:', error);
          }

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
            other_user_name: otherUserName
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

  const markConversationAsRead = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    
    if (!currentUser) return;

    try {
      const { error } = await supabase.rpc('mark_messages_read', {
        conversation_id: conversationId,
        user_id: currentUser.id
      });

      if (error) throw error;

      // Update the local state to remove unread count
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId ? { ...conv, unread_count: 0 } : conv
      ));

      toast({
        title: "Messages marked as read",
        description: "All messages in this conversation are now marked as read.",
      });
    } catch (error: unknown) {
      toast({
        title: "Error marking messages as read",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  };

  const handleDeleteConversation = (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    setConversationToDelete(conversationId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteConversation = async () => {
    if (!conversationToDelete || !currentUser) return;

    try {
      // First delete all messages in the conversation
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationToDelete);

      if (messagesError) throw messagesError;

      // Then delete the conversation
      const { error: conversationError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationToDelete);

      if (conversationError) throw conversationError;

      // Update local state
      setConversations(prev => prev.filter(conv => conv.id !== conversationToDelete));

      toast({
        title: "Conversation deleted",
        description: "The conversation and all its messages have been deleted.",
      });
    } catch (error: unknown) {
      toast({
        title: "Error deleting conversation",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-atmospheric relative overflow-hidden flex flex-col">
        {/* Atmospheric background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 h-96 w-96 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>
        <Helmet>
          <title>Conversations — BU_Basket</title>
        </Helmet>
        <Navbar />
        <main className="relative mx-auto max-w-4xl px-4 py-16 sm:py-20">
          <div className="relative overflow-hidden rounded-3xl border-2 border-brand/30 bg-gradient-to-br from-card/95 via-card/90 to-card/95 p-12 shadow-2xl backdrop-blur-xl text-center">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 opacity-20 blur-3xl animate-pulse" />
            <div className="relative">
              <div className="text-6xl mb-4 animate-bounce">🔐</div>
              <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
              <p className="mb-6 text-lg text-muted-foreground">Please log in to view your conversations.</p>
              <Button variant="hero" size="lg" className="rounded-2xl shadow-glow" onClick={() => navigate('/login')}>
                🚀 Go to Login
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-atmospheric relative overflow-hidden flex flex-col">
        {/* Atmospheric background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 h-96 w-96 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl animate-pulse" />
          <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        </div>
        <Helmet>
          <title>Conversations — BU_Basket</title>
        </Helmet>
        <Navbar />
        <main className="flex-1 relative mx-auto max-w-4xl px-4 py-16 sm:py-20">
          <div className="text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-brand border-t-transparent mb-4" />
            <p className="text-lg text-muted-foreground">Loading conversations...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-atmospheric relative overflow-hidden flex flex-col">
      {/* Atmospheric background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 h-96 w-96 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-brand/10 to-brand-2/10 blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      <Helmet>
        <title>Conversations — BU_Basket</title>
        <meta name="description" content="View and manage your conversations on BU_Basket." />
        <link rel="canonical" href="/conversations" />
      </Helmet>
      <Navbar />
      <main className="flex-1 relative mx-auto max-w-4xl px-4 py-16 sm:py-20">
        {/* Decorative sparkles */}
        <div className="absolute top-10 left-10 text-3xl animate-bounce">💬</div>
        <div className="absolute top-20 right-10 text-3xl animate-bounce" style={{ animationDelay: '0.5s' }}>✨</div>
        
        {/* Page header */}
        <div className="mb-10 text-center">
          <div className="text-6xl sm:text-7xl mb-4 animate-bounce">💭</div>
          <h1 className="mb-3 text-4xl sm:text-5xl font-extrabold">
            Your <span className="bg-gradient-to-r from-purple-500 via-pink-500 to-brand-2 bg-clip-text text-transparent">Conversations</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your chats with buyers and sellers
          </p>
        </div>
        
        {conversations.length === 0 ? (
          <div className="relative overflow-hidden rounded-3xl border-2 border-brand/30 bg-gradient-to-br from-card/95 via-card/90 to-card/95 p-16 shadow-2xl backdrop-blur-xl text-center">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 opacity-20 blur-3xl animate-pulse" />
            <div className="relative">
              <div className="text-7xl mb-4 animate-bounce">📭</div>
              <p className="text-xl font-semibold text-muted-foreground mb-4">No conversations yet.</p>
              <p className="text-base text-muted-foreground mb-6">
                Start chatting by visiting a listing and clicking "Chat with seller".
              </p>
              <Button variant="hero" size="lg" className="rounded-2xl shadow-glow" onClick={() => navigate('/listings')}>
                🛍️ Browse Listings
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conversation) => {
              const isSellerView = conversation.seller_id === currentUser.id;
              const otherUserRole = isSellerView ? 'Buyer' : 'Seller';
              
              return (
                <div
                  key={conversation.id}
                  className="relative overflow-hidden rounded-3xl border-2 border-border/30 bg-gradient-to-br from-card/95 via-card/90 to-card/95 shadow-lg backdrop-blur-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/chat?conversation_id=${conversation.id}`)}
                >
                  <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-brand/10 to-brand-2/10 blur-2xl" />
                  <div className="relative p-5">
                    <div className="flex gap-4">
                      <img
                        src={conversation.listing.image_url || "/placeholder.svg"}
                        alt={conversation.listing.title}
                        className="w-20 h-20 rounded-2xl object-cover border-2 border-border/30 shadow-md"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-lg truncate flex items-center gap-2">
                              <span className="text-xl">💼</span>
                              {conversation.listing.title}
                            </h3>
                            <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                              <span className="text-base">{otherUserRole === 'Buyer' ? '🛒' : '🏪'}</span>
                              {otherUserRole}: {conversation.other_user_name} • <span className="font-semibold text-brand">₹{conversation.listing.price}</span>
                            </p>
                          </div>
                           <div className="flex items-center gap-2">
                             {conversation.unread_count > 0 && (
                               <>
                                 <Button
                                   size="sm"
                                   variant="ghost"
                                   className="h-8 w-8 p-0 hover:bg-brand/10 hover:text-brand rounded-xl transition-all"
                                   onClick={(e) => markConversationAsRead(conversation.id, e)}
                                   title="Mark as read"
                                 >
                                   <Check className="h-4 w-4" />
                                 </Button>
                                 <Badge className="bg-gradient-to-r from-pink-500 to-red-500 text-white border-0 text-xs px-2 py-1 rounded-xl">
                                   {conversation.unread_count}
                                 </Badge>
                               </>
                             )}
                             <Button
                               size="sm"
                               variant="ghost"
                               className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all"
                               onClick={(e) => handleDeleteConversation(conversation.id, e)}
                               title="Delete conversation"
                             >
                               <Trash2 className="h-4 w-4" />
                             </Button>
                             <span className="text-xs text-muted-foreground flex items-center gap-1">
                               <span>⏰</span>
                               {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
                             </span>
                           </div>
                        </div>
                        {conversation.last_message && (
                          <div className="mt-3 p-3 rounded-xl bg-muted/50 border border-border/30">
                            <p className="text-sm text-muted-foreground truncate flex items-center gap-1.5">
                              <span className="text-base">💬</span>
                              {conversation.last_message.sender_id === currentUser.id ? <span className="font-medium text-brand">You:</span> : ''}
                              {conversation.last_message.content}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone and will delete all messages in this conversation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteConversation}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Conversations;