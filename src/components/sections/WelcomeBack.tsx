import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { ShoppingBag, MessageCircle, Plus } from "lucide-react";

const WelcomeBack = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  const displayName = user.email?.split('@')[0] || 'Student';

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
          <Link to="/chat">
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