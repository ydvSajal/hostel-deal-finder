import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTAJoin = () => {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-16">
      <div className="rounded-2xl border bg-card/80 p-10 text-center shadow-sm backdrop-blur">
        <h3 className="text-2xl font-bold">Abhi tak join nahi kiya? College email se login karo! ✉️</h3>
        <p className="mt-2 text-muted-foreground">Verified BU ID ke saath safe community marketplace.</p>
        <div className="mt-6 flex items-center justify-center gap-4">
          <Link to="/login"><Button variant="default" className="rounded-full px-6">Login / Sign up</Button></Link>
          <Link to="/listings"><Button variant="outline" className="rounded-full px-6">Browse Listings</Button></Link>
        </div>
      </div>
    </section>
  );
};

export default CTAJoin;
