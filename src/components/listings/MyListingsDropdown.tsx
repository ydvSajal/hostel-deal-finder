import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { Store, Trash2, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface UserListing {
  id: string;
  title: string;
  price: number;
  image_url: string;
  created_at: string;
}

const MyListingsDropdown = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<UserListing[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteListingId, setDeleteListingId] = useState<string | null>(null);
  const [deletingListingId, setDeletingListingId] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);

  // Cache duration: 30 seconds
  const CACHE_DURATION = 30 * 1000;

  const loadUserListings = useCallback(async (force = false) => {
    if (!user) {
      console.log('No user, skipping load');
      return;
    }
    
    // Check cache validity
    const now = Date.now();
    if (!force && lastFetch && (now - lastFetch) < CACHE_DURATION) {
      console.log('Using cached data, not reloading');
      return; // Use cached data
    }
    
    console.log('Loading user listings...');
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('id, title, price, image_url, created_at')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5); // Reduced limit for better performance

      if (error) {
        console.error('Error loading user listings:', error);
        toast({
          title: "Error",
          description: "Failed to load your listings.",
          variant: "destructive"
        });
      } else {
        console.log('Loaded listings:', data?.length || 0);
        setListings(data || []);
        setLastFetch(now);
      }
    } catch (error) {
      console.error('Error loading user listings:', error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, CACHE_DURATION]); // Removed lastFetch from dependencies to prevent loops

  // Load listings only on initial mount and user change
  useEffect(() => {
    if (user) {
      loadUserListings();
    }
  }, [user]); // Removed loadUserListings from dependencies to prevent infinite loops

  const handleDeleteListing = useCallback(async (listingId: string) => {
    if (!user || deletingListingId) {
      console.log('Delete blocked: user or already deleting', { user: !!user, deletingListingId });
      return; // Prevent multiple simultaneous deletes
    }
    
    console.log('Starting delete for listing:', listingId);
    setDeletingListingId(listingId);
    
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId)
        .eq('seller_id', user.id); // Extra security check

      if (error) {
        console.error('Delete error:', error);
        toast({
          title: "Error",
          description: "Failed to delete listing. Please try again.",
          variant: "destructive"
        });
      } else {
        console.log('Delete successful, updating UI');
        // Optimistically update UI
        setListings(prev => {
          const newListings = prev.filter(listing => listing.id !== listingId);
          console.log('Updated listings count:', newListings.length);
          return newListings;
        });
        toast({
          title: "Success",
          description: "Listing deleted successfully.",
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Error",
        description: "Failed to delete listing. Please try again.",
        variant: "destructive"
      });
    } finally {
      console.log('Delete operation finished');
      setDeletingListingId(null);
      setDeleteListingId(null);
    }
  }, [user, deletingListingId]);

  const handleDropdownOpenChange = useCallback((open: boolean) => {
    console.log('Dropdown open change:', open);
    setIsOpen(open);
    if (open) {
      // Only reload if cache is stale
      const now = Date.now();
      if (!lastFetch || (now - lastFetch) > CACHE_DURATION) {
        console.log('Cache stale, reloading listings');
        loadUserListings();
      } else {
        console.log('Using cached listings');
      }
    }
  }, [CACHE_DURATION, lastFetch]); // Removed loadUserListings from dependencies

  // Memoize the listings count for display
  const listingsCount = useMemo(() => listings.length, [listings.length]);

  if (!user) return null;

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={handleDropdownOpenChange}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <Store className="h-4 w-4" />
            My Listings
            {listingsCount > 0 && (
              <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                {listingsCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80 bg-background border shadow-lg" align="end">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>My Listings ({listingsCount})</span>
            <div className="flex gap-1">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Manual refresh clicked');
                  loadUserListings(true);
                }}
                disabled={loading}
                className="h-6 w-6 p-0"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link to="/sell">
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Link>
              </Button>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {loading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading your listings...
            </div>
          ) : listings.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">No listings yet</p>
              <Button asChild size="sm" variant="outline">
                <Link to="/sell">Create your first listing</Link>
              </Button>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {listings.map((listing) => (
                <DropdownMenuItem key={listing.id} className="p-0">
                  <div className="flex items-center gap-3 w-full p-3 hover:bg-muted rounded">
                     <img
                       src={listing.image_url || "/placeholder.svg"}
                       alt={listing.title}
                       loading="lazy"
                       className="h-10 w-10 rounded object-cover flex-shrink-0"
                       onError={(e) => {
                         e.currentTarget.src = "/placeholder.svg";
                       }}
                     />
                     <div className="flex-1 min-w-0">
                       <p className="text-sm font-medium truncate" title={listing.title}>
                         {listing.title}
                       </p>
                       <p className="text-xs text-muted-foreground">₹{listing.price}</p>
                     </div>
                     <Button
                       variant="ghost"
                       size="sm"
                       disabled={deletingListingId === listing.id}
                       className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 disabled:opacity-50"
                       onClick={(e) => {
                         e.preventDefault();
                         e.stopPropagation();
                         console.log('Delete button clicked for:', listing.id);
                         if (deletingListingId) {
                           console.log('Delete already in progress, ignoring');
                           return;
                         }
                         setDeleteListingId(listing.id);
                       }}
                       title={deletingListingId === listing.id ? "Deleting..." : "Delete listing"}
                     >
                       {deletingListingId === listing.id ? (
                         <RefreshCw className="h-3 w-3 animate-spin" />
                       ) : (
                         <Trash2 className="h-3 w-3" />
                       )}
                     </Button>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

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
                  console.log('Confirm delete clicked for:', deleteListingId);
                  handleDeleteListing(deleteListingId);
                } else {
                  console.log('Delete confirm blocked - already deleting');
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
            >
              {deletingListingId ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MyListingsDropdown;