import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const data = [
  { id: 1, title: "Physics Notes (SEM-2)", price: 199, category: "Books" },
  { id: 2, title: "Bucket + Mug Combo", price: 149, category: "Essentials" },
  { id: 3, title: "Table Lamp", price: 299, category: "Essentials" },
  { id: 4, title: "Coding DSA Book", price: 249, category: "Books" },
];

const Listings = () => {
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((item) => (
            <article key={item.id} className="rounded-xl border bg-card p-4 shadow-sm">
              <img
                src="/placeholder.svg"
                loading="lazy"
                alt={`${item.title} product image`}
                className="mb-3 h-40 w-full rounded-lg object-cover"
              />
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.category}</p>
              <p className="mt-2 font-medium">₹{item.price}</p>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Listings;
