import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const CTAJoin = () => {
  return (
    <section className="mx-auto max-w-5xl px-4 pb-16" aria-labelledby="cta-heading">
      <div className="rounded-2xl border bg-card/80 p-6 sm:p-10 text-center shadow-sm backdrop-blur">
        <h2 id="cta-heading" className="text-xl sm:text-2xl font-bold">Abhi tak join nahi kiya? College email se login karo! ✉️</h2>
        <p className="mt-2 text-sm sm:text-base text-muted-foreground">Verified BU ID ke saath safe community marketplace.</p>
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link to="/login" className="w-full sm:w-auto">
            <Button variant="default" className="w-full sm:w-auto rounded-full px-6">Login / Sign up</Button>
          </Link>
          <Link to="/listings" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto rounded-full px-6">Browse Listings</Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CTAJoin;
