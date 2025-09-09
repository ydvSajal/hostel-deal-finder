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
    <section className="mx-auto max-w-5xl px-4 pb-16">
      <div className="rounded-2xl border bg-gradient-to-br from-brand/5 to-brand-2/5 p-10 text-center shadow-sm backdrop-blur">
        <h3 className="text-2xl font-bold">
          Welcome back, {displayName}! 👋
        </h3>
        <p className="mt-2 text-muted-foreground">
          Ready to explore what's available on campus today?
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
          <Link to="/listings">
            <Button variant="hero" className="rounded-full px-6">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Browse Items
            </Button>
          </Link>
          <Link to="/sell">
            <Button variant="successGradient" className="rounded-full px-6">
              <Plus className="mr-2 h-4 w-4" />
              Sell Something
            </Button>
          </Link>
          <Link to="/conversations">
            <Button variant="outline" className="rounded-full px-6">
              <MessageCircle className="mr-2 h-4 w-4" />
              Messages
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default WelcomeBack;