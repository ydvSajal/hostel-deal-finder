import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Sell = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    price: '',
    description: ''
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editListingId = searchParams.get('edit');
  const isEditMode = !!editListingId;

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      setLoading(false);
    };
    getUser();
  }, []);

  // Load existing listing data when in edit mode
  useEffect(() => {
    const loadListingData = async () => {
      if (!editListingId || !currentUser) return;

      const { data: listing, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', editListingId)
        .eq('seller_id', currentUser.id)
        .single();

      if (error) {
        toast({
          title: "Error",
          description: "Could not load listing data.",
          variant: "destructive"
        });
        return;
      }

      if (listing) {
        setFormData({
          title: listing.title || '',
          category: listing.category || '',
          price: listing.price?.toString() || '',
          description: listing.description || ''
        });
        setExistingImageUrl(listing.image_url);
      }
    };

    if (currentUser && editListingId) {
      loadListingData();
    }
  }, [editListingId, currentUser, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setSelectedImages(files.slice(0, 3)); // Limit to 3 images
    }
  };

  const uploadImages = async (listingId: string): Promise<string[]> => {
    if (selectedImages.length === 0) return [];

    const uploadPromises = selectedImages.map(async (file, index) => {
      const fileName = `${currentUser.id}/${listingId}/${index}_${Date.now()}.${file.name.split('.').pop()}`;
      
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      return publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to create a listing.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      if (isEditMode && editListingId) {
        // Update existing listing
        let imageUrl = existingImageUrl;
        
        // Upload new images if selected
        if (selectedImages.length > 0) {
          const imageUrls = await uploadImages(editListingId);
          imageUrl = imageUrls[0] || existingImageUrl;
        }

        const { error: updateError } = await supabase
          .from('listings')
          .update({
            title: formData.title,
            category: formData.category,
            price: parseFloat(formData.price),
            description: formData.description,
            image_url: imageUrl
          })
          .eq('id', editListingId)
          .eq('seller_id', currentUser.id);

        if (updateError) throw updateError;

        toast({
          title: "Success!",
          description: "Your listing has been updated successfully.",
        });
        navigate('/my-listings');
      } else {
        // Create new listing
        const { data: listingData, error: listingError } = await supabase
          .from('listings')
          .insert({
            title: formData.title,
            category: formData.category,
            price: parseFloat(formData.price),
            description: formData.description,
            seller_id: currentUser.id
          })
          .select()
          .single();

      if (listingError) throw listingError;

      // Then upload images if any
      let imageUrls: string[] = [];
      if (selectedImages.length > 0) {
        imageUrls = await uploadImages(listingData.id);
        
        // Update the listing with the first image URL
        if (imageUrls.length > 0) {
          const { error: updateError } = await supabase
            .from('listings')
            .update({ image_url: imageUrls[0] })
            .eq('id', listingData.id);

          if (updateError) throw updateError;
        }
      }

      toast({
        title: "Listing created!",
        description: "Your item is now available for buyers to see."
      });

      navigate('/listings');
      }
    } catch (error: unknown) {
      toast({
        title: isEditMode ? "Error updating listing" : "Error creating listing",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-atmospheric">
        <Helmet>
          <title>Sell an Item — BU_Basket</title>
        </Helmet>
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-20">
          <div className="relative overflow-hidden rounded-3xl border border-brand/20 bg-gradient-card p-12 shadow-elegant backdrop-blur-xl">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand border-t-transparent" />
              <p className="mt-4 text-muted-foreground">Loading...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-atmospheric">
        <Helmet>
          <title>Sell an Item — BU_Basket</title>
          <meta name="description" content="Create a listing to sell your items on BU_Basket marketplace." />
          <link rel="canonical" href="/sell" />
        </Helmet>
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-20">
          <div className="relative overflow-hidden rounded-3xl border border-destructive/20 bg-gradient-card p-12 shadow-elegant backdrop-blur-xl text-center">
            <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gradient-primary opacity-5 blur-3xl" />
            <div className="relative">
              <p className="mb-6 text-lg text-muted-foreground">You need to be logged in to create a listing.</p>
              <Button variant="hero" size="lg" className="rounded-full shadow-glow" onClick={() => navigate('/login')}>
                Go to Login
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-atmospheric relative overflow-hidden">
      {/* Atmospheric background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 h-96 w-96 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-brand/10 to-brand-2/10 blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      <Helmet>
        <title>{isEditMode ? 'Edit Your Listing' : 'Sell Your Item'} — BU_Basket | List Books, Electronics & More</title>
        <meta name="description" content="Sell your items on BU_Basket marketplace. List textbooks, electronics, furniture, and hostel essentials. Free listing, verified students only, fast & safe transactions." />
        <meta name="keywords" content="sell items BU, sell textbooks, sell electronics, list items campus, student marketplace, sell furniture BU, hostel items sale" />
        <link rel="canonical" href="https://bu-basket.com/sell" />
        <meta property="og:title" content="Sell Your Item on BU_Basket" />
        <meta property="og:description" content="List your items for free on BU's trusted student marketplace. Fast & safe." />
        <meta property="og:url" content="https://bu-basket.com/sell" />
      </Helmet>
      <Navbar />
      <main className="relative mx-auto max-w-2xl px-4 py-16 sm:py-20">
        {/* Decorative sparkles */}
        <div className="absolute top-10 left-10 text-3xl animate-bounce">💰</div>
        <div className="absolute top-20 right-10 text-3xl animate-bounce" style={{ animationDelay: '0.5s' }}>✨</div>
        
        {/* Page header */}
        <div className="mb-10 text-center">
          <div className="text-6xl sm:text-7xl mb-4 animate-bounce">🏪</div>
          <h1 className="mb-3 text-4xl sm:text-5xl font-extrabold">
            {isEditMode ? 'Edit Your' : 'Sell Your'} <span className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 bg-clip-text text-transparent">Item</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            {isEditMode ? 'Update your listing details' : 'List your item and connect with buyers on campus'}
          </p>
        </div>

        <div className="relative overflow-hidden rounded-3xl border-2 border-brand/30 bg-gradient-to-br from-card/95 via-card/90 to-card/95 shadow-2xl backdrop-blur-xl">
          {/* Floating gradient orbs */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 opacity-20 blur-3xl animate-pulse" />
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          
          {/* Sparkle decorations */}
          <div className="absolute top-6 right-6 text-2xl animate-bounce">🌟</div>
          <div className="absolute bottom-6 left-6 text-2xl animate-bounce" style={{ animationDelay: '1s' }}>💫</div>

          <div className="relative z-10 p-8 sm:p-10">
            <h2 className="mb-6 text-2xl font-bold flex items-center gap-2">
              <span className="text-3xl">📝</span>
              Item Details
            </h2>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="title" className="text-sm font-semibold flex items-center gap-2">
                  🏷️ Title *
                </Label>
                <Input 
                  id="title"
                  name="title"
                  placeholder="e.g., DSA Book" 
                  value={formData.title}
                  onChange={handleInputChange}
                  required 
                  className="h-14 rounded-2xl border-2 border-border/50 bg-background/50 backdrop-blur-sm transition-all duration-300 focus:border-brand focus:ring-4 focus:ring-brand/20 text-base hover:border-brand/50"
                />
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="category" className="text-sm font-semibold flex items-center gap-2">
                    📚 Category *
                  </Label>
                  <Input 
                    id="category"
                    name="category"
                    placeholder="Books / Essentials" 
                    value={formData.category}
                    onChange={handleInputChange}
                    required 
                    className="h-14 rounded-2xl border-2 border-border/50 bg-background/50 backdrop-blur-sm transition-all duration-300 focus:border-brand focus:ring-4 focus:ring-brand/20 text-base hover:border-brand/50"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="price" className="text-sm font-semibold flex items-center gap-2">
                    💵 Price (₹) *
                  </Label>
                  <Input 
                    id="price"
                    name="price"
                    type="number" 
                    min={0} 
                    step={1} 
                    value={formData.price}
                    onChange={handleInputChange}
                    required 
                    className="h-14 rounded-2xl border-2 border-border/50 bg-background/50 backdrop-blur-sm transition-all duration-300 focus:border-brand focus:ring-4 focus:ring-brand/20 text-base hover:border-brand/50"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="description" className="text-sm font-semibold flex items-center gap-2">
                  📄 Description
                </Label>
                <Textarea 
                  id="description"
                  name="description"
                  placeholder="Add condition, pickup spot, etc." 
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="rounded-2xl border-2 border-border/50 bg-background/50 backdrop-blur-sm transition-all duration-300 focus:border-brand focus:ring-4 focus:ring-brand/20 resize-none hover:border-brand/50 text-base"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="images" className="text-sm font-semibold flex items-center gap-2">
                  📸 Images (Max 3)
                </Label>
                <Input 
                  id="images"
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleImageChange}
                  className="h-14 rounded-2xl border-2 border-border/50 bg-background/50 backdrop-blur-sm transition-all duration-300 focus:border-brand focus:ring-4 focus:ring-brand/20 text-base hover:border-brand/50 file:mr-4 file:h-10 file:rounded-xl file:border-0 file:bg-gradient-to-r file:from-brand file:to-brand-2 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:opacity-90 cursor-pointer"
                />
                {selectedImages.length > 0 && (
                  <div className="mt-3 flex items-center gap-2 rounded-xl border-2 border-green-500/30 bg-green-500/10 px-4 py-3">
                    <span className="text-xl">✅</span>
                    <p className="text-sm font-medium text-green-600 dark:text-green-400">
                      {selectedImages.length} image(s) selected
                    </p>
                  </div>
                )}
              </div>
              <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 text-white font-bold text-lg shadow-2xl hover:scale-105 hover:shadow-glow transition-all duration-300" 
                disabled={uploading}
              >
                {uploading ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span> {isEditMode ? 'Updating...' : 'Publishing...'}
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    {isEditMode ? '💾 Update Listing' : '🚀 Publish Listing'}
                  </span>
                )}
              </Button>

              {/* Trust badges */}
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">🔒</span>
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">⚡</span>
                  <span>Fast</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">🤝</span>
                  <span>Trusted</span>
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Sell;