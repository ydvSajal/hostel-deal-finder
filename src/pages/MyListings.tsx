import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Store, Trash2, Plus, RefreshCw, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Helmet } from "react-helmet-async";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

interface UserListing {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  image_url: string | null;
  created_at: string;
}

const MyListings = () => {
  const { user, loading: authLoading } = useAuth();
  const [listings, setListings] = useState<UserListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteListingId, setDeleteListingId] = useState<string | null>(null);
  const [deletingListingId, setDeletingListingId] = useState<string | null>(null);

  const loadUserListings = useCallback(async () => {
    if (!user?.id) {
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('id, title, description, price, image_url, created_at')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading user listings:', error);
        toast({
          title: "Error",
          description: `Failed to load your listings: ${error.message}`,
          variant: "destructive"
        });
      } else {
        setListings(data || []);
      }
    } catch (error) {
      console.error('Unexpected error loading user listings:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      if (user) {
        loadUserListings();
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading, loadUserListings]);

  const handleDeleteListing = useCallback(async (listingId: string) => {
    if (!user || deletingListingId) return;
    
    setDeletingListingId(listingId);
    
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId)
        .eq('seller_id', user.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete listing. Please try again.",
          variant: "destructive"
        });
      } else {
        setListings(prev => prev.filter(listing => listing.id !== listingId));
        toast({
          title: "Success",
          description: "Listing deleted successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete listing. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeletingListingId(null);
      setDeleteListingId(null);
    }
  }, [user, deletingListingId]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Loading...</h1>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please log in to view your listings</h1>
            <Link to="/login">
              <Button>Login</Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>My Listings — BU_Basket | Manage Your Items</title>
        <meta name="description" content="Manage your listings on BU_Basket. Edit, delete, or update your items for sale." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Store className="h-8 w-8 text-[hsl(var(--brand))]" />
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">My Listings</h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Manage your {listings.length} listing{listings.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex flex-row gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => loadUserListings()}
              disabled={loading}
              className="flex-1 sm:flex-initial"
            >
              <RefreshCw className={`h-4 w-4 sm:mr-2 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
            <Link to="/sell" className="flex-1 sm:flex-initial">
              <Button variant="successGradient" className="w-full">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Create Listing</span>
                <span className="sm:hidden">Create</span>
              </Button>
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-muted rounded-t-lg" />
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded mb-2" />
                  <div className="h-3 bg-muted rounded w-2/3 mb-2" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <Store className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No listings yet</h2>
            <p className="text-muted-foreground mb-6">
              Start selling by creating your first listing
            </p>
            <Link to="/sell">
              <Button variant="successGradient" size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Create Your First Listing
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-[4/3] relative bg-muted/20">
                  <img
                    src={listing.image_url || "/placeholder.svg"}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg";
                    }}
                  />
                  <Badge 
                    variant="default"
                    className="absolute top-2 right-2"
                  >
                    Active
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">
                    {listing.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {listing.description || "No description provided"}
                  </p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-[hsl(var(--brand))]">
                      ₹{listing.price || 0}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(listing.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Link to={`/sell?edit=${listing.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={deletingListingId === listing.id}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteListingId(listing.id)}
                    >
                      {deletingListingId === listing.id ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Footer />

      <AlertDialog open={!!deleteListingId} onOpenChange={() => setDeleteListingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Listing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this listing? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={!!deletingListingId}
              onClick={() => {
                if (deleteListingId && !deletingListingId) {
                  handleDeleteListing(deleteListingId);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingListingId ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MyListings;