import { useState, useEffect, useRef } from "react";
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
  const [isDeleting, setIsDeleting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  // Use refs to avoid dependency issues
  const lastFetchRef = useRef<number>(0);
  const isMountedRef = useRef(true);
  const loadingRef = useRef(false);
  
  const CACHE_DURATION = 30000; // 30 seconds

  // Simple function without useCallback to avoid dependency issues
  const loadUserListings = async (force = false) => {
    if (!user || loadingRef.current) {
      console.log('Load blocked: no user or already loading');
      return;
    }
    
    // Check cache
    const now = Date.now();
    if (!force && lastFetchRef.current && (now - lastFetchRef.current) < CACHE_DURATION) {
      console.log('Using cached listings');
      return;
    }
    
    console.log('Loading user listings...');
    loadingRef.current = true;
    setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('id, title, price, image_url, created_at')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (!isMountedRef.current) return;

      if (error) {
        console.error('Error loading listings:', error);
        toast({
          title: "Error",
          description: "Failed to load your listings.",
          variant: "destructive"
        });
      } else {
        console.log('Loaded listings:', data?.length || 0);
        setListings(data || []);
        lastFetchRef.current = now;
      }
    } catch (error) {
      console.error('Error loading listings:', error);
      if (isMountedRef.current) {
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      loadingRef.current = false;
    }
  };

  // Simple delete function without useCallback
  const handleDeleteListing = async (listingId: string) => {
    if (!user || isDeleting) {
      console.log('Delete blocked: no user or already deleting');
      return;
    }
    
    console.log('Starting delete for:', listingId);
    setIsDeleting(true);
    
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId)
        .eq('seller_id', user.id);

      if (!isMountedRef.current) return;

      if (error) {
        console.error('Delete error:', error);
        toast({
          title: "Error",
          description: "Failed to delete listing. Please try again.",
          variant: "destructive"
        });
      } else {
        console.log('Delete successful');
        // Update listings immediately
        setListings(prev => prev.filter(listing => listing.id !== listingId));
        toast({
          title: "Success",
          description: "Listing deleted successfully.",
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
      if (isMountedRef.current) {
        toast({
          title: "Error",
          description: "Failed to delete listing. Please try again.",
          variant: "destructive"
        });
      }
    } finally {
      if (isMountedRef.current) {
        setIsDeleting(false);
        setDeleteListingId(null);
      }
    }
  };

  // Simple dropdown handler
  const handleDropdownChange = (open: boolean) => {
    console.log('Dropdown toggled:', open);
    setIsOpen(open);
    
    if (open && user) {
      // Check if we need to reload
      const now = Date.now();
      if (!lastFetchRef.current || (now - lastFetchRef.current) > CACHE_DURATION) {
        loadUserListings();
      }
    }
  };

  // Load listings on user change only
  useEffect(() => {
    if (user) {
      loadUserListings();
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [user?.id]); // Only depend on user ID

  if (!user) return null;

  const listingsCount = listings.length;

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={handleDropdownChange}>
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
        <DropdownMenuContent className="w-80 bg-background border shadow-lg z-50" align="end">
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
                disabled={loading || isDeleting}
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
                      disabled={isDeleting}
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 disabled:opacity-50"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log('Delete button clicked for:', listing.id);
                        if (!isDeleting) {
                          setDeleteListingId(listing.id);
                        }
                      }}
                      title={isDeleting ? "Deleting..." : "Delete listing"}
                    >
                      {isDeleting && deleteListingId === listing.id ? (
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

      <AlertDialog 
        open={!!deleteListingId} 
        onOpenChange={(open) => {
          if (!open && !isDeleting) {
            setDeleteListingId(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Listing</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this listing? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              onClick={() => {
                if (deleteListingId && !isDeleting) {
                  console.log('Confirm delete clicked for:', deleteListingId);
                  handleDeleteListing(deleteListingId);
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MyListingsDropdown;