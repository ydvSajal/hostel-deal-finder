import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="bg-hero relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-2 h-2 bg-brand/30 rounded-full animate-pulse"></div>
        <div className="absolute top-20 right-20 w-1 h-1 bg-brand-2/40 rounded-full animate-pulse delay-500"></div>
        <div className="absolute bottom-32 left-32 w-1.5 h-1.5 bg-success/25 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute bottom-20 right-40 w-1 h-1 bg-brand/20 rounded-full animate-pulse delay-1500"></div>
      </div>
      <div className="mx-auto max-w-6xl px-4 py-14 text-center relative z-10">
        <p className="mb-3 text-sm text-muted-foreground">Apne hostel ka OLX — BU Campus</p>
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight tracking-tight md:text-6xl">
          <span className="text-gradient-primary">BU_Basket</span> Campus
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
          Buy, sell, borrow — sab kuch campus ke andar. Safe, fast, aur bina jhanjhat.
        </p>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Link to="/sell"><Button variant="successGradient" size="xl">Becho 🔥</Button></Link>
          <Link to="/listings"><Button variant="hero" size="xl">Kharido 🛍️</Button></Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
