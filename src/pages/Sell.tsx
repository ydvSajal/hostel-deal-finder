import { Helmet } from "react-helmet-async";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Sell = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
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
    } catch (error: any) {
      toast({
        title: "Error creating listing",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>Sell an Item — BU_Basket</title>
        </Helmet>
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-10">
          <p>Loading...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background">
        <Helmet>
          <title>Sell an Item — BU_Basket</title>
          <meta name="description" content="Create a listing to sell your items on BU_Basket marketplace." />
          <link rel="canonical" href="/sell" />
        </Helmet>
        <Navbar />
        <main className="mx-auto max-w-2xl px-4 py-10">
          <Card>
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">You need to be logged in to create a listing.</p>
              <Button onClick={() => navigate('/login')}>Go to Login</Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Sell an Item — BU_Basket</title>
        <meta name="description" content="Create a listing to sell your items on BU_Basket marketplace." />
        <link rel="canonical" href="/sell" />
      </Helmet>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="mb-6 text-3xl font-bold">Sell an Item</h1>
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium">Title</label>
            <Input 
              name="title"
              placeholder="e.g., DSA Book" 
              value={formData.title}
              onChange={handleInputChange}
              required 
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Category</label>
              <Input 
                name="category"
                placeholder="Books / Essentials" 
                value={formData.category}
                onChange={handleInputChange}
                required 
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Price (₹)</label>
              <Input 
                name="price"
                type="number" 
                min={0} 
                step={1} 
                value={formData.price}
                onChange={handleInputChange}
                required 
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <Textarea 
              name="description"
              placeholder="Add condition, pickup spot, etc." 
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Images (Max 3)</label>
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              onChange={handleImageChange}
              className="block w-full rounded-md border bg-background p-2" 
            />
            {selectedImages.length > 0 && (
              <div className="mt-2 flex gap-2 flex-wrap">
                {selectedImages.map((file, index) => (
                  <div key={index} className="text-xs text-muted-foreground">
                    📷 {file.name}
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button type="submit" variant="hero" className="rounded-full" disabled={uploading}>
            {uploading ? "Publishing..." : "Publish Listing"}
          </Button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default Sell;