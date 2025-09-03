import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  seller_hash: string;
  created_at: string;
}

const Listings = () => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const loadData = async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // Load listings using secure function
      const { data: listingsData, error } = await supabase
        .rpc('get_public_listings');

      if (error) {
        console.error('Error loading listings:', error);
      } else {
        setListings(listingsData || []);
      }

      setLoading(false);
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>Listings — BU_Basket</title>
        </Helmet>
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-10">
          <p>Loading listings...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Listings — BU_Basket</title>
        <meta name="description" content="Browse student listings across books, notes and daily essentials at BU_Basket." />
        <link rel="canonical" href="/listings" />
      </Helmet>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-6 text-3xl font-bold">Browse Listings</h1>
        {listings.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No listings available yet.</p>
            <p className="text-sm text-muted-foreground mt-2">
              <Link to="/sell" className="text-primary underline">Create the first listing</Link>
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <article key={listing.id} className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-lg transition-all duration-300">
                <img
                  src={listing.image_url || "/placeholder.svg"}
                  loading="lazy"
                  alt={`${listing.title} product image`}
                  className="mb-3 h-40 w-full rounded-lg object-cover"
                />
                <h3 className="font-semibold">{listing.title}</h3>
                <p className="text-sm text-muted-foreground">{listing.category}</p>
                <p className="mt-2 font-medium">₹{listing.price}</p>
                {listing.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{listing.description}</p>
                )}
                <div className="mt-3">
                  {currentUser ? (
                    <Button asChild size="sm" className="w-full bg-gradient-to-r from-[hsl(var(--brand))] to-[hsl(var(--brand-2))] text-white hover:shadow-glow transition-all duration-300">
                      <Link to={`/chat?listing_id=${listing.id}`}>
                        💬 Chat with seller
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild size="sm" variant="outline" className="w-full">
                      <Link to="/login">
                        Login to chat
                      </Link>
                    </Button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Listings;
