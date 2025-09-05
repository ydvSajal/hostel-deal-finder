import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import HowItWorks from "@/components/sections/HowItWorks";
import CTAJoin from "@/components/sections/CTAJoin";
import WelcomeBack from "@/components/sections/WelcomeBack";
import { useAuth } from "@/hooks/useAuth";
import { Helmet } from "react-helmet-async";

const Index = () => {
  const { isAuthenticated, loading } = useAuth();

  return (
    <div className="min-h-screen bg-atmospheric">
      {/* Floating orbs for visual interest */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -left-32 w-64 h-64 bg-brand-2/4 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-success/3 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>
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
        {!loading && (isAuthenticated ? <WelcomeBack /> : <CTAJoin />)}
      </main>
      <Footer />
    </div>
  );
};

export default Index;
