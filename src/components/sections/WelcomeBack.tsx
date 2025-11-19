import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ShoppingBag, MessageCircle, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const WelcomeBack = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState<string>('Student');
  
  useEffect(() => {
    const fetchDisplayName = async () => {
      if (!user?.id) return;
      
      try {
        const { data, error } = await supabase.rpc('get_safe_profile', {
          profile_user_id: user.id,
          requesting_user_id: user.id
        });
        
        if (!error && data && data.length > 0 && data[0].display_name) {
          setDisplayName(data[0].display_name);
        } else {
          // Fallback to email username
          setDisplayName(user.email?.split('@')[0] || 'Student');
        }
      } catch (error) {
        console.warn('Error fetching profile:', error);
        // Fallback to email username
        setDisplayName(user.email?.split('@')[0] || 'Student');
      }
    };

    fetchDisplayName();
  }, [user]);
  
  if (!user) return null;

  return (
    <section className="relative mx-auto max-w-5xl px-4 pb-20">
      <div className="absolute inset-0 bg-gradient-radial from-success/10 via-transparent to-transparent blur-3xl" />
      <div className="relative overflow-hidden rounded-3xl border border-success/20 bg-gradient-to-br from-success/5 via-card/80 to-brand/5 p-10 sm:p-12 text-center shadow-elegant backdrop-blur-xl">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-success opacity-10 blur-3xl" />
        <div className="absolute -left-16 -bottom-16 h-56 w-56 rounded-full bg-gradient-primary opacity-10 blur-3xl" />
        <div className="relative">
          <h3 className="text-3xl sm:text-4xl font-bold leading-tight">
            Welcome back, <span className="text-gradient-success">{displayName}</span>! 👋
          </h3>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">
            Ready to explore what's available on campus today?
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to="/listings">
              <Button variant="hero" size="lg" className="rounded-full px-8 shadow-glow hover-lift">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Browse Items
              </Button>
            </Link>
            <Link to="/sell">
              <Button variant="successGradient" size="lg" className="rounded-full px-8 shadow-glow hover-lift">
                <Plus className="mr-2 h-5 w-5" />
                Sell Something
              </Button>
            </Link>
            <Link to="/conversations">
              <Button variant="outline" size="lg" className="rounded-full px-8 border-brand/30 hover:bg-brand/5 hover-lift">
                <MessageCircle className="mr-2 h-5 w-5" />
                Messages
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelcomeBack;