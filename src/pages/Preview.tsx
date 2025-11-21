import React, { useMemo } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';

const MobileFrame: React.FC<{ src: string }> = ({ src }) => {
  return (
    <div className="relative w-[320px] sm:w-[360px] md:w-[400px] mx-auto shadow-2xl rounded-3xl overflow-hidden border-8 border-white/90 bg-black animate-fade-in">
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-2 rounded-full bg-slate-700/60" />
      <iframe
        title="mobile-preview"
        src={src}
        className="w-full h-[640px] transform scale-[0.99] origin-top-left"
        style={{ border: 'none' }}
      />
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-20 h-4 rounded-full bg-slate-800/70" />
    </div>
  );
};

const Preview = () => {
  const origin = (typeof window !== 'undefined' && window.location.origin) ? window.location.origin : 'https://bu-basket.com';
  const targetUrl = useMemo(() => `${origin}`, [origin]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background/90 via-pink-50 to-background flex flex-col">
      <Helmet>
        <title>Preview — BU_Basket Mobile Preview</title>
        <meta name="description" content="Preview and QR share page for BU_Basket mobile app" />
      </Helmet>

      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Mobile Preview & QR Share</h1>
          <p className="text-muted-foreground mb-8">Scan the QR code to open the app on your phone, or interact with the live mobile preview below.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-2xl bg-card/80 shadow-lg backdrop-blur-md border border-border/50 animate-slide-up">
                <MobileFrame src={targetUrl} />
              </div>

              <div className="mt-2 text-sm text-muted-foreground">Interactive preview (desktop may show scaled view)</div>
            </div>

            <div className="flex flex-col items-center gap-6">
              <div className="p-6 rounded-2xl bg-card/90 shadow-lg border border-border/50 w-full flex flex-col items-center gap-4 animate-fade-in">
                <img src="/qr.png" alt="QR code" className="w-64 h-64 rounded-lg shadow" />

                <div className="text-center">
                  <h3 className="font-semibold text-lg">Scan to Open</h3>
                  <p className="text-sm text-muted-foreground">Opens: <span className="break-all">{targetUrl}</span></p>
                </div>

                <div className="w-full flex gap-3">
                  <a href="/qr.png" download="bu-basket-qr.png" className="flex-1">
                    <Button variant="outline" className="w-full">Download QR</Button>
                  </a>
                  <a href={targetUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                    <Button className="w-full">Open Site</Button>
                  </a>
                </div>
              </div>

              <div className="text-sm text-muted-foreground max-w-md">
                <p className="mb-2">This preview simulates the mobile viewport. Use the QR code to quickly open the site on your phone and test installation or PWA behavior. The preview updates automatically to the current origin.</p>
                <p>If you want the QR to target a specific URL (e.g., preview a listing), append the path to the URL in your browser first.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Preview;
