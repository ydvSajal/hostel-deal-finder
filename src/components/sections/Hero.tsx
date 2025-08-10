import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section className="bg-hero">
      <div className="mx-auto max-w-6xl px-4 py-14 text-center">
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
