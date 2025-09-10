import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Store, Trash2, Plus } from "lucide-react";
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

  const loadUserListings = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('id, title, price, image_url, created_at')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error loading user listings:', error);
        toast({
          title: "Error",
          description: "Failed to load your listings.",
          variant: "destructive"
        });
      } else {
        setListings(data || []);
      }
    } catch (error) {
      console.error('Error loading user listings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadUserListings();
    }
  }, [user]);

  const handleDeleteListing = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId)
        .eq('seller_id', user?.id); // Extra security check

      if (error) {
        toast({
          title: "Error",
          description: "Failed to delete listing. Please try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Listing deleted successfully.",
        });
        // Refresh listings
        loadUserListings();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete listing. Please try again.",
        variant: "destructive"
      });
    } finally {
      setDeleteListingId(null);
    }
  };

  if (!user) return null;

  return (
    <>
      <DropdownMenu onOpenChange={(open) => open && loadUserListings()}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
            <Store className="h-4 w-4" />
            My Listings
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-80" align="end">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>My Listings</span>
            <Button asChild size="sm" variant="outline">
              <Link to="/sell">
                <Plus className="h-3 w-3 mr-1" />
                Add New
              </Link>
            </Button>
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
                      className="h-10 w-10 rounded object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{listing.title}</p>
                      <p className="text-xs text-muted-foreground">₹{listing.price}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeleteListingId(listing.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
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
              onClick={() => deleteListingId && handleDeleteListing(deleteListingId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MyListingsDropdown;