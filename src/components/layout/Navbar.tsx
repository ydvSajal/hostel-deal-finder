import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingBasket, LogOut, MessageCircle, User, Settings, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import ProfileAvatar from "@/components/profile/ProfileAvatar";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const loadUnreadCount = async () => {
      try {
        // Get user's conversations
        const { data: conversations, error: convError } = await supabase
          .from('conversations')
          .select('id')
          .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);

        if (convError) {
          console.error('Error loading conversations:', convError);
          return;
        }

        if (!conversations || conversations.length === 0) {
          setUnreadCount(0);
          return;
        }

        // Count unread messages across all conversations
        let totalUnread = 0;
        for (const conv of conversations) {
          try {
            const { count, error: msgError } = await supabase
              .from('messages')
              .select('*', { count: 'exact', head: true })
              .eq('conversation_id', conv.id)
              .neq('sender_id', user.id)
              .is('read_at', null);
            
            if (msgError) {
              console.error('Error counting messages for conversation:', conv.id, msgError);
              continue;
            }
            
            totalUnread += count || 0;
          } catch (error) {
            console.error('Error processing conversation:', conv.id, error);
          }
        }
        
        setUnreadCount(totalUnread);
      } catch (error) {
        console.error('Error loading unread count:', error);
        setUnreadCount(0);
      }
    };

    loadUnreadCount();

    // Subscribe to new messages and message updates to update unread count
    const channel = supabase
      .channel('navbar-messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, () => {
        loadUnreadCount();
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages'
      }, () => {
        loadUnreadCount();
      })
      .subscribe();

    return () => {
      try {
        supabase.removeChannel(channel);
      } catch (error) {
        console.error('Error removing channel:', error);
      }
    };
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
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
            <>
              <NavLink to="/conversations" className={({ isActive }) => `relative flex items-center gap-1 ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <MessageCircle className="h-4 w-4" />
                Messages
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-xs px-1 py-0 min-w-[1.25rem] h-5">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </NavLink>
              <NavLink to="/my-listings" className={({ isActive }) => `flex items-center gap-1 ${isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                <Store className="h-4 w-4" />
                My Listings
              </NavLink>
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/sell"><Button variant="successGradient" size="sm" className="hidden md:inline-flex">Sell</Button></Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <ProfileAvatar size="sm" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user.email?.split('@')[0]}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
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
