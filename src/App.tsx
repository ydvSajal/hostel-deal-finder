import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { HelmetProvider } from "react-helmet-async";
import SecurityHeaders from "@/components/security/SecurityHeaders";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Listings from "./pages/Listings";
import Sell from "./pages/Sell";
import Chat from "./pages/Chat";
import Conversations from "./pages/Conversations";
import TestChat from "./pages/TestChat";
import Privacy from "./pages/Privacy";
import EmailConfirmed from "./pages/EmailConfirmed";
import Profile from "./pages/Profile";

const queryClient = new QueryClient();

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <TooltipProvider>
          <BrowserRouter>
            <SecurityHeaders />
            <Toaster />
            <Sonner />
            <SpeedInsights />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/listings" element={<Listings />} />
              <Route path="/sell" element={<Sell />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/conversations" element={<Conversations />} />
              <Route path="/test-chat" element={<TestChat />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/email-confirmed" element={<EmailConfirmed />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </HelmetProvider>
    </QueryClientProvider>
  );
};

export default App;