import { Link, NavLink } from "react-router-dom";
import { ShoppingBasket } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <ShoppingBasket className="h-5 w-5 text-[hsl(var(--brand))]" aria-hidden />
          <span className="font-semibold tracking-tight text-gradient-primary">BU_Basket</span>
        </Link>

        <div className="hidden items-center gap-4 md:flex">
          <NavLink to="/listings" className={({ isActive }) => isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}>Browse</NavLink>
          <NavLink to="/chat" className={({ isActive }) => isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"}>Chat</NavLink>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/sell"><Button variant="successGradient" size="sm" className="hidden md:inline-flex">Sell</Button></Link>
          <Link to="/login"><Button variant="outline" size="sm">Login</Button></Link>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
