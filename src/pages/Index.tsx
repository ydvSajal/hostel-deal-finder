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

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BU_Basket',
    alternateName: 'BU Basket Campus Marketplace',
    url: 'https://bu-basket.com',
    description: 'Student-only marketplace for BU campus. Buy, sell, and borrow books, electronics, furniture, and daily essentials safely with verified college email.',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://bu-basket.com/listings?q={search_term_string}'
      },
      'query-input': 'required name=search_term_string',
    },
    publisher: {
      '@type': 'Organization',
      name: 'BU_Basket',
      url: 'https://bu-basket.com'
    }
  };

  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://bu-basket.com'
      }
    ]
  };

  return (
    <div className="min-h-screen bg-atmospheric overflow-x-hidden overflow-y-auto">
      <Helmet>
        <title>BU_Basket — Campus Marketplace for BU Students | Buy, Sell & Borrow</title>
        <meta name="description" content="BU_Basket is the trusted student marketplace for BU campus. Buy, sell, and borrow textbooks, electronics, furniture, and daily essentials. Safe transactions with verified college email. Join 1000+ BU students today!" />
        <meta name="keywords" content="BU marketplace, BU campus marketplace, BU student marketplace, buy sell BU, college marketplace, BU textbooks, BU electronics, hostel essentials, student trading, campus buy sell, BU books, BU furniture, BU deals" />
        <link rel="canonical" href="https://bu-basket.com/" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://bu-basket.com/" />
        <meta property="og:title" content="BU_Basket — Campus Marketplace for BU Students" />
        <meta property="og:description" content="Join 1000+ BU students buying, selling & borrowing safely on campus. Verified email. No middleman. Fast deals." />
        <meta property="og:site_name" content="BU_Basket" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="BU_Basket — Campus Marketplace" />
        <meta name="twitter:description" content="BU's trusted student marketplace. Safe, fast, verified." />
        
        {/* Mobile Optimization */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes" />
        
        {/* Structured Data */}
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbData)}</script>
      </Helmet>
      <Navbar />
      <main className="overflow-y-auto">
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
