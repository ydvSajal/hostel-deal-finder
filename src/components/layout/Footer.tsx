import { Link } from "react-router-dom";
import { ShoppingBasket, Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="relative border-t border-border/30 bg-background/95 backdrop-blur-sm overflow-hidden">
      {/* Subtle decorative background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute -bottom-10 left-1/3 h-40 w-40 rounded-full bg-gradient-to-br from-brand/20 to-brand-2/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
          {/* Brand Section */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <ShoppingBasket className="h-4 w-4 sm:h-5 sm:w-5 text-brand group-hover:scale-110 transition-transform" />
              <span className="font-bold text-gradient-primary">BU_Basket</span>
            </Link>
            <span className="text-muted-foreground">© {new Date().getFullYear()}</span>
          </div>

          {/* Right Side Info */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-muted-foreground">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm">
              <span className="hidden xs:inline">Made with</span>
              <Heart className="h-3 w-3 text-red-500 fill-red-500 animate-pulse" />
              <span className="hidden xs:inline">for BU students</span>
            </div>
            <span className="hidden sm:inline text-muted-foreground/50">•</span>
            <Link to="/privacy" className="hover:text-brand transition-colors">
              Privacy
            </Link>
            <span className="hidden sm:inline text-muted-foreground/50">•</span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success"></span>
              </span>
              Live
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
