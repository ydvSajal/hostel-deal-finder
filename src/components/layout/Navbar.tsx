import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingBasket, LogOut, MessageCircle, User, Settings, Store, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex h-12 md:h-14 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-1.5 md:gap-2 group">
          <div className="relative">
            <ShoppingBasket className="h-4 w-4 md:h-5 md:w-5 text-brand transition-transform group-hover:scale-110 duration-200" aria-hidden />
            <div className="absolute inset-0 bg-brand/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
          </div>
          <span className="text-base md:text-lg font-bold tracking-tight text-gradient-primary">BU_Basket</span>
        </Link>

        <div className="hidden items-center gap-0.5 md:flex">
          <NavLink to="/listings" className={({ isActive }) => `px-2.5 py-1.5 text-xs md:text-sm font-medium rounded-lg transition-all duration-200 ${isActive ? "text-foreground bg-accent" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"}`}>Browse</NavLink>
          {user && (
            <>
              <NavLink to="/conversations" className={({ isActive }) => `relative flex items-center gap-1.5 px-2.5 py-1.5 text-xs md:text-sm font-medium rounded-lg transition-all duration-200 ${isActive ? "text-foreground bg-accent" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"}`}>
                <MessageCircle className="h-3.5 w-3.5 md:h-4 md:w-4" />
                Messages
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-[9px] md:text-[10px] px-1 py-0 min-w-[1rem] h-3.5 font-semibold">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </Badge>
                )}
              </NavLink>
              <NavLink to="/my-listings" className={({ isActive }) => `flex items-center gap-1.5 px-2.5 py-1.5 text-xs md:text-sm font-medium rounded-lg transition-all duration-200 ${isActive ? "text-foreground bg-accent" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"}`}>
                <Store className="h-3.5 w-3.5 md:h-4 md:w-4" />
                My Listings
              </NavLink>
            </>
          )}
        </div>

        <div className="flex items-center gap-1.5 md:gap-2">
          {/* Mobile Menu */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" className="md:hidden hover:bg-accent h-8 w-8">
                <Menu className="h-4 w-4" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <ShoppingBasket className="h-5 w-5 text-brand" />
                  <span className="text-gradient-primary">BU_Basket</span>
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-8 flex flex-col gap-4">
                <Link to="/listings" className="flex items-center gap-2 text-base font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                  Browse
                </Link>
                {user && (
                  <>
                    <Link to="/conversations" className="flex items-center gap-2 text-base font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                      <MessageCircle className="h-5 w-5" />
                      Messages
                      {unreadCount > 0 && (
                        <Badge variant="destructive" className="text-xs px-1.5 py-0.5 ml-auto">
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                      )}
                    </Link>
                    <Link to="/my-listings" className="flex items-center gap-2 text-base font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                      <Store className="h-5 w-5" />
                      My Listings
                    </Link>
                    <Link to="/sell" className="flex items-center gap-2 text-base font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                      Sell Item
                    </Link>
                    <Link to="/profile" className="flex items-center gap-2 text-base font-medium py-2" onClick={() => setMobileMenuOpen(false)}>
                      <User className="h-5 w-5" />
                      Profile
                    </Link>
                    <Button variant="outline" onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="mt-4 justify-start">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </Button>
                  </>
                )}
                {!user && (
                  <>
                    <Link to="/sell" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="successGradient" className="w-full">Sell</Button>
                    </Link>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">Login</Button>
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>

          {user ? (
            <>
              <Link to="/sell" className="hidden md:block"><Button variant="successGradient" size="sm" className="font-medium shadow-lg shadow-success/20 hover:shadow-xl hover:shadow-success/30 transition-all duration-200 h-8 text-xs">Sell</Button></Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-accent transition-colors duration-200">
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
              <Link to="/sell" className="hidden md:block"><Button variant="successGradient" size="sm" className="shadow-lg shadow-success/20 hover:shadow-xl hover:shadow-success/30 transition-all duration-200 h-8 text-xs">Sell</Button></Link>
              <Link to="/login"><Button variant="outline" size="sm" className="border-border/60 hover:bg-accent transition-colors duration-200 h-8 text-xs">Login</Button></Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
