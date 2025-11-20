import React, { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { HelmetProvider } from "react-helmet-async";
import SecurityHeaders from "@/components/security/SecurityHeaders";
import ErrorBoundary from "@/components/ErrorBoundary";

// Lazy load pages for better initial load performance
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Login = lazy(() => import("./pages/Login"));
const Listings = lazy(() => import("./pages/Listings"));
const Sell = lazy(() => import("./pages/Sell"));
const Chat = lazy(() => import("./pages/Chat"));
const Conversations = lazy(() => import("./pages/Conversations"));
const TestChat = lazy(() => import("./pages/TestChat"));
const ChatDebug = lazy(() => import("./pages/ChatDebug"));
const Privacy = lazy(() => import("./pages/Privacy"));
const EmailConfirmed = lazy(() => import("./pages/EmailConfirmed"));
const Profile = lazy(() => import("./pages/Profile"));
const MyListings = lazy(() => import("./pages/MyListings"));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-atmospheric">
    <div className="text-center">
      <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-brand border-t-transparent mb-4" />
      <p className="text-muted-foreground">Loading...</p>
    </div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <TooltipProvider>
            <BrowserRouter>
              <SecurityHeaders />
              <Toaster />
              <Sonner />
              <SpeedInsights />
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/listings" element={<Listings />} />
                  <Route path="/sell" element={<Sell />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/conversations" element={<Conversations />} />
                  <Route path="/test-chat" element={<TestChat />} />
                  <Route path="/chat-debug" element={<ChatDebug />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/email-confirmed" element={<EmailConfirmed />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/my-listings" element={<MyListings />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </HelmetProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;