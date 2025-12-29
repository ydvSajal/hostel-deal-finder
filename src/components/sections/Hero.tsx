import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import Ballpit from "@/components/Ballpit";
import MobileHeroAnimation from "@/components/MobileHeroAnimation";
import { useEffect, useState } from "react";

const Hero = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section className="relative w-full h-screen overflow-hidden flex items-center justify-center flex-shrink-0">
      {/* Desktop: Ballpit Animation Background */}
      {!isMobile && (
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" style={{ willChange: 'transform', width: '100%', height: '100%' }}>
          <Ballpit
            count={150}
            gravity={0.7}
            friction={0.8}
            wallBounce={0.95}
            followCursor={false}
          />
        </div>
      )}
      
      {/* Mobile: Custom Floating Animation */}
      {isMobile && (
        <div className="absolute inset-0 z-0 overflow-hidden">
          <MobileHeroAnimation />
        </div>
      )}
      
      {/* Content overlay */}
      <div className="mx-auto max-w-6xl px-4 text-center relative z-10 w-full flex flex-col items-center justify-center gap-2 sm:gap-3">
        <p className="text-xs sm:text-sm md:text-base text-muted-foreground backdrop-blur-sm bg-background/30 inline-block px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">Apne hostel ka OLX — BU Campus</p>
        <h1 className="mx-auto max-w-3xl text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold leading-tight tracking-tight">
          <span className="text-gradient-primary drop-shadow-lg">BU_Basket</span> <span className="text-foreground drop-shadow-lg">Campus</span>
        </h1>
        <p className="mx-auto max-w-2xl text-sm sm:text-base md:text-lg text-muted-foreground backdrop-blur-sm bg-background/40 inline-block px-4 sm:px-6 py-2 sm:py-3 rounded-2xl">
          Buy, sell, borrow — sab kuch campus ke andar. Safe, fast, aur bina jhanjhat.
        </p>
        <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-6 px-4 sm:px-0">
          <Link to="/sell" className="w-full sm:w-auto">
            <Button variant="successGradient" size="xl" className="w-full sm:w-auto text-sm sm:text-base md:text-lg shadow-2xl hover:scale-105 transition-transform">Becho 🔥</Button>
          </Link>
          <Link to="/listings" className="w-full sm:w-auto">
            <Button variant="hero" size="xl" className="w-full sm:w-auto text-sm sm:text-base md:text-lg shadow-2xl hover:scale-105 transition-transform">Kharido 🛍️</Button>
          </Link>
          <Button 
            variant="infoGradient" 
            size="xl"
            className="w-full sm:w-auto text-sm sm:text-base md:text-lg shadow-2xl hover:scale-105 transition-transform"
            onClick={() => window.open('https://docs.google.com/forms/d/e/1FAIpQLSdLYopQ2dCo_kBtnhMHmZq7cKgQeuBSWh5H368NKWNyoHiV4A/viewform?usp=header', '_blank', 'noopener,noreferrer')}
          >
            Borrow 📚
          </Button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
