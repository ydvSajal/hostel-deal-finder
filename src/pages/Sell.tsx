import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      setLoading(false);
    };
    getUser();
  }, []);

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
      // First create the listing
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
    } catch (error: unknown) {
      toast({
        title: "Error creating listing",
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
    <div className="min-h-screen bg-atmospheric">
      <Helmet>
        <title>Sell an Item — BU_Basket</title>
        <meta name="description" content="Create a listing to sell your items on BU_Basket marketplace." />
        <link rel="canonical" href="/sell" />
      </Helmet>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-20">
        <div className="mb-10 text-center">
          <h1 className="mb-3 text-4xl font-bold">
            Sell Your <span className="text-gradient-success">Item</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            List your item and connect with buyers on campus
          </p>
        </div>
        <div className="relative overflow-hidden rounded-3xl border-2 border-border/30 bg-card shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-xl">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-gradient-success opacity-5 blur-3xl" />
          <div className="relative p-8 sm:p-10">
            <h2 className="mb-6 text-2xl font-bold">Item Details</h2>
            <form onSubmit={onSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">Title *</Label>
                <Input 
                  id="title"
                  name="title"
                  placeholder="e.g., DSA Book" 
                  value={formData.title}
                  onChange={handleInputChange}
                  required 
                  className="h-12 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm transition-smooth focus:border-brand focus:ring-brand/20"
                />
              </div>
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category" className="text-sm font-medium">Category *</Label>
                  <Input 
                    id="category"
                    name="category"
                    placeholder="Books / Essentials" 
                    value={formData.category}
                    onChange={handleInputChange}
                    required 
                    className="h-12 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm transition-smooth focus:border-brand focus:ring-brand/20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-sm font-medium">Price (₹) *</Label>
                  <Input 
                    id="price"
                    name="price"
                    type="number" 
                    min={0} 
                    step={1} 
                    value={formData.price}
                    onChange={handleInputChange}
                    required 
                    className="h-12 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm transition-smooth focus:border-brand focus:ring-brand/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea 
                  id="description"
                  name="description"
                  placeholder="Add condition, pickup spot, etc." 
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="rounded-xl border-border/50 bg-background/50 backdrop-blur-sm transition-smooth focus:border-brand focus:ring-brand/20 resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="images" className="text-sm font-medium">Images (Max 3)</Label>
                <Input 
                  id="images"
                  type="file" 
                  accept="image/*" 
                  multiple 
                  onChange={handleImageChange}
                  className="h-12 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm transition-smooth file:mr-4 file:rounded-lg file:border-0 file:bg-brand file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-foreground hover:file:bg-brand/90"
                />
                {selectedImages.length > 0 && (
                  <p className="mt-2 text-sm text-success">
                    ✓ {selectedImages.length} image(s) selected
                  </p>
                )}
              </div>
              <Button type="submit" variant="successGradient" size="lg" className="w-full rounded-xl shadow-glow" disabled={uploading}>
                {uploading ? "Publishing..." : "Publish Listing"}
              </Button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Sell;