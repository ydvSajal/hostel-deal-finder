import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const EmailConfirmed = () => {
  const navigate = useNavigate();

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // Get the session to check if user is authenticated
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          setStatus('error');
          setMessage('There was an error confirming your email. Please try again.');
          return;
        }

        if (session?.user) {
          // User is authenticated and email is confirmed
          setStatus('success');
          setMessage('Your college email has been successfully verified!');

          toast({
            title: "Welcome to BU_Basket! 🎉",
            description: "Your account is now verified and ready to use.",
          });

          // Redirect to home page after 3 seconds
          setTimeout(() => {
            navigate('/', { replace: true });
          }, 3000);
        } else {
          setStatus('error');
          setMessage('Email confirmation failed. Please try clicking the link again or request a new confirmation email.');
        }
      } catch (error) {
        console.error('Confirmation error:', error);
        setStatus('error');
        setMessage('An unexpected error occurred. Please try again.');
      }
    };

    handleEmailConfirmation();
  }, [navigate]);

  const handleContinue = () => {
    navigate('/', { replace: true });
  };

  const handleBackToLogin = () => {
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-atmospheric">
      {/* Floating orbs for visual interest */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -left-32 w-64 h-64 bg-brand-2/4 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-success/3 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      <Helmet>
        <title>Email Confirmed — BU_Basket</title>
        <meta name="description" content="Your college email has been confirmed for BU_Basket." />
      </Helmet>
      
      <Navbar />
      
      <main className="relative z-10 container mx-auto px-4 py-16 max-w-md">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4">
              {status === 'loading' && (
                <Loader2 className="h-16 w-16 text-blue-500 animate-spin" />
              )}
              {status === 'success' && (
                <CheckCircle className="h-16 w-16 text-green-500" />
              )}
              {status === 'error' && (
                <AlertCircle className="h-16 w-16 text-red-500" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {status === 'loading' && 'Confirming your email...'}
              {status === 'success' && 'Email Confirmed! ✅'}
              {status === 'error' && 'Confirmation Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              {status === 'loading' && 'Please wait while we verify your college email address.'}
              {message}
            </p>
            
            {status === 'success' && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-800">
                    🎓 Your @bennett.edu.in email has been verified!<br/>
                    You now have full access to BU_Basket.
                  </p>
                </div>
                <Button onClick={handleContinue} variant="hero" size="lg" className="w-full">
                  Continue to BU_Basket
                </Button>
                <p className="text-sm text-gray-500">
                  Redirecting automatically in a few seconds...
                </p>
              </div>
            )}
            
            {status === 'error' && (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-800">
                    If you continue to have issues, please try:
                  </p>
                  <ul className="text-sm text-red-700 mt-2 list-disc list-inside">
                    <li>Requesting a new confirmation email</li>
                    <li>Checking that you're using your @bennett.edu.in email</li>
                    <li>Clearing your browser cache and cookies</li>
                  </ul>
                </div>
                <Button onClick={handleBackToLogin} variant="outline" className="w-full">
                  Back to Login
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      
      <Footer />
    </div>
  );
};

export default EmailConfirmed;