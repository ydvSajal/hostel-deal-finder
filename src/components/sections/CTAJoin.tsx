import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTAJoin = () => {
  return (
    <section className="relative mx-auto max-w-6xl px-4 pb-24" aria-labelledby="cta-heading">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>
      
      <div className="relative overflow-hidden rounded-3xl border-2 border-brand/30 bg-gradient-to-br from-brand/15 via-card/90 to-brand-2/15 p-10 sm:p-16 text-center shadow-2xl backdrop-blur-xl">
        {/* Floating orbs */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-primary opacity-20 blur-3xl animate-pulse" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-gradient-success opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        {/* Decorative sparkles */}
        <div className="absolute top-10 left-10 text-2xl animate-bounce">✨</div>
        <div className="absolute top-10 right-10 text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>✨</div>
        <div className="absolute bottom-10 left-20 text-2xl animate-bounce" style={{ animationDelay: '1s' }}>⭐</div>
        <div className="absolute bottom-10 right-20 text-2xl animate-bounce" style={{ animationDelay: '1.5s' }}>⭐</div>
        
        <div className="relative z-10">
          {/* Large emoji */}
          <div className="mb-6 inline-block">
            <div className="text-6xl sm:text-7xl animate-bounce">🎉</div>
          </div>
          
          <h2 id="cta-heading" className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-4">
            Abhi tak join nahi kiya?
          </h2>
          <p className="text-xl sm:text-2xl font-semibold text-gradient-primary mb-2">
            College email se login karo! ✉️
          </p>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Verified BU ID ke saath safe community marketplace.
          </p>
          
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-5">
            <Link to="/login" className="w-full sm:w-auto">
              <Button 
                variant="hero" 
                size="lg" 
                className="w-full sm:w-auto rounded-full px-10 py-7 text-lg font-bold shadow-2xl hover:shadow-glow hover:scale-105 transition-all duration-300"
              >
                🚀 Login / Sign up
              </Button>
            </Link>
            <Link to="/listings" className="w-full sm:w-auto">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto rounded-full px-10 py-7 text-lg font-semibold border-2 border-brand/40 hover:bg-brand/10 hover:border-brand hover:scale-105 transition-all duration-300"
              >
                👀 Browse Listings
              </Button>
            </Link>
          </div>
          
          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔒</span>
              <span>Verified Students</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span>Fast Deals</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🤝</span>
              <span>Trusted Community</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTAJoin;
