import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import HowItWorks from "@/components/sections/HowItWorks";
import CTAJoin from "@/components/sections/CTAJoin";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>BU_Basket — Campus Marketplace</title>
        <meta name="description" content="Buy, sell, borrow within BU campus. Student-only marketplace with verified college email login." />
        <link rel="canonical" href="/" />
        <script type="application/ld+json">{JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'BU_Basket',
          url: '/',
          potentialAction: {
            '@type': 'SearchAction',
            target: '/listings?q={search_term_string}',
            'query-input': 'required name=search_term_string',
          },
        })}</script>
      </Helmet>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <CTAJoin />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
