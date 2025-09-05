import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingBasket, LogOut, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    const loadUnreadCount = async () => {
      try {
        // Get user's conversations
        const { data: conversations } = await supabase
          .from('conversations')
          .select('id')
          .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

        if (!conversations) return;

        // Count unread messages across all conversations
        let totalUnread = 0;
        for (const conv of conversations) {
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', user.id);
          
          totalUnread += count || 0;
        }
        
        setUnreadCount(totalUnread);
      } catch (error) {
        console.error('Error loading unread count:', error);
      }
    };

    loadUnreadCount();

    // Subscribe to new messages to update unread count
    const channel = supabase
      .channel('navbar-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, () => {
        loadUnreadCount();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You've been successfully logged out.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <ShoppingBasket className="h-5 w-5 text-[hsl(var(--brand))]" aria-hidden />
          <span className="font-semibold tracking-tight text-gradient-primary">BU_Basket</span>
        </Link>

        <div className="hidden items-center gap-4 md:flex">
          <NavLink to="/listings" className={({ isActive }) => isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}>Browse</NavLink>
          {user && (
            <NavLink to="/conversations" className={({ isActive }) => `relative flex items-center gap-1 ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
              <MessageCircle className="h-4 w-4" />
              Messages
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs px-1 py-0 min-w-[1.25rem] h-5">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </NavLink>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/sell"><Button variant="successGradient" size="sm" className="hidden md:inline-flex">Sell</Button></Link>
              <span className="text-sm text-muted-foreground hidden md:inline">
                {user.email?.split('@')[0]}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Link to="/sell"><Button variant="successGradient" size="sm" className="hidden md:inline-flex">Sell</Button></Link>
              <Link to="/login"><Button variant="outline" size="sm">Login</Button></Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
