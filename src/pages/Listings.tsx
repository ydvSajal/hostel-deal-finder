import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import FadeContent from "@/components/FadeContent";

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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentUserHash, setCurrentUserHash] = useState<string | null>(null);

  // Function to generate user hash (same as backend)
  const generateUserHash = async (userId: string): Promise<string> => {
    const encoder = new TextEncoder();
    const data = encoder.encode(userId);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  useEffect(() => {
    const loadData = async () => {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // Generate current user hash if user exists
      if (user) {
        try {
          const userHash = await generateUserHash(user.id);
          setCurrentUserHash(userHash);
        } catch (error) {
          console.error('Error generating user hash:', error);
        }
      }

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
      <div className="min-h-screen bg-background flex flex-col">
        <Helmet>
          <title>Listings — BU_Basket</title>
        </Helmet>
        <Navbar />
        <main className="flex-1 mx-auto max-w-6xl px-4 py-10">
          <p>Loading listings...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-atmospheric relative overflow-hidden flex flex-col">
      {/* Animated background blobs - keeping the atmospheric vibe */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 h-96 w-96 rounded-full bg-gradient-to-br from-purple-500/15 to-pink-500/15 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/15 to-cyan-500/15 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/3 left-1/3 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-brand/8 to-brand-2/8 blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
      </div>
      
      <Helmet>
        <title>Browse Listings — BU_Basket | Student Marketplace</title>
        <meta name="description" content="Browse verified student listings on BU campus. Find textbooks, electronics, furniture, and daily essentials. Safe deals with college email verification. Updated daily." />
        <meta name="keywords" content="BU listings, student items for sale, campus marketplace, buy textbooks BU, electronics for sale, furniture marketplace, hostel essentials" />
        <link rel="canonical" href="https://bu-basket.com/listings" />
        <meta property="og:title" content="Browse Student Listings on BU_Basket" />
        <meta property="og:description" content="Find great deals from verified BU students. Textbooks, electronics & more." />
        <meta property="og:url" content="https://bu-basket.com/listings" />
      </Helmet>
      <Navbar />
      <main className="flex-1 relative mx-auto max-w-7xl px-4 py-12">
        <FadeContent blur={true} duration={800} easing="ease-out" initialOpacity={0}>
          {/* Page header with emoji and gradient */}
          <div className="mb-10 text-center">
            <div className="text-5xl mb-4 animate-bounce">🛍️</div>
            <h1 className="mb-3 text-4xl md:text-5xl font-extrabold tracking-tight">
              Browse <span className="text-gradient-primary">Listings</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              {listings.length > 0 
                ? `${listings.length} items available on campus`
                : "Start shopping from your hostel mates!"
              }
            </p>
          </div>
          
          {listings.length === 0 ? (
            <div className="relative overflow-hidden rounded-3xl border-2 border-brand/20 bg-card/80 backdrop-blur-xl p-16 text-center shadow-2xl">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-primary opacity-10 blur-3xl" />
              <div className="relative">
                <div className="text-7xl mb-6 animate-bounce">📦</div>
                <p className="text-xl font-semibold text-muted-foreground mb-2">No listings available yet.</p>
                <p className="text-base text-muted-foreground mb-6">
                  Be the first to list an item!
                </p>
                <Link to="/sell">
                  <Button variant="hero" size="lg" className="rounded-full px-8 shadow-glow">
                    🚀 Create First Listing
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((listing, idx) => (
                <FadeContent key={listing.id} duration={600} delay={idx * 60} initialOpacity={0.001}>
                  <article className="group relative overflow-hidden rounded-3xl border-2 border-transparent bg-card hover:border-brand/40 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105">
                    {/* Gradient glow on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-brand-2/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Image with overlay gradient */}
                    <div className="relative overflow-hidden rounded-t-3xl aspect-[4/3] bg-muted/20 flex items-center justify-center">
                      <img
                        src={listing.image_url || "/placeholder.svg"}
                        loading="lazy"
                        alt={`${listing.title} product image`}
                        className="w-full h-full object-contain p-3 transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Category badge */}
                      <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold border border-border/50">
                        {listing.category}
                      </div>
                    </div>
                    
                    <div className="relative p-5">
                      <h3 className="font-bold text-lg mb-1 line-clamp-1">{listing.title}</h3>
                      
                      {/* Price with currency icon */}
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-2xl font-extrabold text-gradient-primary">₹{listing.price}</span>
                      </div>
                      
                      {listing.description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed">{listing.description}</p>
                      )}
                      
                      <div className="mt-4">
                        {currentUser ? (
                          currentUserHash === listing.seller_hash ? (
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="w-full h-11 rounded-2xl border-2 border-border/40 bg-muted/30 hover:bg-muted/50 hover:border-border/60 font-semibold" 
                              disabled
                            >
                              <span className="flex items-center gap-2">
                                <span>📝</span>
                                Your listing
                              </span>
                            </Button>
                          ) : (
                            <Button 
                              asChild 
                              size="sm" 
                              className="w-full h-11 rounded-2xl bg-gradient-to-r from-[hsl(var(--brand))] to-[hsl(var(--brand-2))] text-white font-bold shadow-lg hover:shadow-glow hover:scale-105 transition-all duration-300"
                            >
                              <Link to={`/chat?listing_id=${listing.id}`}>
                                <span className="flex items-center gap-2">
                                  <span>💬</span>
                                  Chat with seller
                                </span>
                              </Link>
                            </Button>
                          )
                        ) : (
                          <Button 
                            asChild 
                            size="sm" 
                            variant="outline" 
                            className="w-full h-11 rounded-2xl border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 hover:border-primary/50 hover:scale-105 font-semibold transition-all duration-300"
                          >
                            <Link to="/login">
                              <span className="flex items-center gap-2">
                                <span>🔐</span>
                                Login to chat
                              </span>
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </article>
                </FadeContent>
              ))}
            </div>
          )}
        </FadeContent>
      </main>
      <Footer />
    </div>
  );
};

export default Listings;
