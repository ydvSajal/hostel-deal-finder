import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

const Sell = () => {
  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Connect Supabase to enable selling",
      description: "We’ll store product images securely and publish your listing once Supabase is connected.",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Sell an Item — BU_Basket</title>
        <meta name="description" content="Post a listing on BU_Basket. Images and data will be stored securely once Supabase is connected." />
        <link rel="canonical" href="/sell" />
      </Helmet>
      <Navbar />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="mb-6 text-3xl font-bold">Sell an Item</h1>
        <form onSubmit={onSubmit} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium">Title</label>
            <Input placeholder="e.g., DSA Book" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">Category</label>
              <Input placeholder="Books / Essentials" required />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Price (₹)</label>
              <Input type="number" min={0} step={1} required />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Description</label>
            <Textarea placeholder="Add condition, pickup spot, etc." rows={4} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Images</label>
            <input type="file" accept="image/*" multiple className="block w-full rounded-md border bg-background p-2" />
            <p className="mt-1 text-xs text-muted-foreground">Images will be uploaded to secure storage once Supabase is connected.</p>
          </div>
          <Button type="submit" variant="hero" className="rounded-full">Publish</Button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default Sell;
