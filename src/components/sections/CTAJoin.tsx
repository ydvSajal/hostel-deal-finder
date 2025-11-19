import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTAJoin = () => {
  return (
    <section className="relative mx-auto max-w-5xl px-4 pb-20" aria-labelledby="cta-heading">
      <div className="absolute inset-0 bg-gradient-radial from-brand/10 via-transparent to-transparent blur-3xl" />
      <div className="relative overflow-hidden rounded-3xl border border-brand/20 bg-gradient-to-br from-brand/10 via-card/80 to-brand-2/10 p-8 sm:p-12 text-center shadow-elegant backdrop-blur-xl">
        <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gradient-primary opacity-10 blur-3xl" />
        <div className="absolute -left-12 -bottom-12 h-48 w-48 rounded-full bg-gradient-success opacity-10 blur-3xl" />
        <div className="relative">
          <h2 id="cta-heading" className="text-2xl sm:text-3xl font-bold leading-tight">
            Abhi tak join nahi kiya?<br />College email se login karo! ✉️
          </h2>
          <p className="mt-3 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Verified BU ID ke saath safe community marketplace.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login" className="w-full sm:w-auto">
              <Button variant="hero" size="lg" className="w-full sm:w-auto rounded-full px-8 shadow-glow">
                Login / Sign up
              </Button>
            </Link>
            <Link to="/listings" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto rounded-full px-8 border-brand/30 hover:bg-brand/5">
                Browse Listings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTAJoin;
