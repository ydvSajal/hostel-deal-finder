import { Link, NavLink, useNavigate } from "react-router-dom";
import { ShoppingBasket, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Navbar = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

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
            <NavLink to="/chat" className={({ isActive }) => isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}>Chat</NavLink>
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
