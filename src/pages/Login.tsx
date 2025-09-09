import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { config } from "@/lib/config";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if user came from email confirmation
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('confirmed') === 'true') {
      toast({
        title: "Email verified! ✅",
        description: "Your college email has been confirmed. You can now log in to BU_Basket.",
      });
      // Clear the URL parameter
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        toast({
          title: "Welcome back!",
          description: "You're now logged in.",
        });
        navigate("/", { replace: true });
      }
      
      if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Email confirmed via link, redirect to main page
        toast({
          title: "Email verified!",
          description: "Your college email has been confirmed. Welcome to BU_Basket!",
        });
        navigate("/", { replace: true });
      }
    });
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        navigate("/", { replace: true });
      }
    });
    
    return () => subscription.unsubscribe();
  }, [navigate]);

  const isCollegeEmail = (val: string) => config.isCollegeEmail(val);

  const sendOTP = async () => {
    if (!isCollegeEmail(email)) {
      toast({
        title: "Use your college email",
        description: `Only addresses ending with @${config.collegeEmailDomain} are allowed.`,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: config.emailRedirectUrl,
          data: {
            display_name: email.split('@')[0],
            college_email: email,
            college_domain: 'bennett.edu.in'
          }
        }
      });
      
      if (error) throw error;
      
      setOtpSent(true);
      toast({
        title: "OTP sent! 📧",
        description: "Check your college email for the 6-digit verification code.",
      });
    } catch (err: unknown) {
      toast({
        title: "Error sending OTP",
        description: err instanceof Error ? err.message : "Failed to send verification code.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the complete 6-digit code.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email'
      });
      
      if (error) throw error;
      
      if (data.session?.user) {
        toast({
          title: "Welcome! 👋",
          description: "You're now logged in.",
        });
        navigate("/", { replace: true });
      }
    } catch (err: unknown) {
      toast({
        title: "Invalid code",
        description: err instanceof Error ? err.message : "Please check your code and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setOtpSent(false);
    setOtp("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Login — BU_Basket</title>
        <meta name="description" content="Login or sign up using your @bennett.edu.in email to access BU_Basket." />
        <link rel="canonical" href="/login" />
      </Helmet>
      <Navbar />
      <main className="mx-auto max-w-xl px-4 py-16">
        <h1 className="mb-2 text-3xl font-bold">
          {!otpSent ? "Login with Email OTP" : "Enter Verification Code"}
        </h1>
        <p className="mb-6 text-muted-foreground">
          {!otpSent 
            ? `Enter your @${config.collegeEmailDomain} email to receive a verification code.`
            : `We've sent a 6-digit code to ${email}. Check your email for the code (look for the numbers, not the magic link).`
          }
        </p>
        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          {!otpSent ? (
            <form onSubmit={(e) => { e.preventDefault(); sendOTP(); }} className="space-y-4">
              <div>
                <Label htmlFor="email">College email</Label>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  placeholder={`you@${config.collegeEmailDomain}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  pattern={`.*@${config.collegeEmailDomain.replace('.', '\\.')}`}
                />
              </div>
              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
                {loading ? "Sending code..." : "Send OTP"}
              </Button>
            </form>
          ) : (
            <form onSubmit={verifyOTP} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp">Enter 6-digit code</Label>
                <div className="flex justify-center">
                  <InputOTP
                    value={otp}
                    onChange={setOtp}
                    maxLength={6}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>
              <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading || otp.length !== 6}>
                {loading ? "Verifying..." : "Login"}
              </Button>
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleBack} className="flex-1">
                  Back
                </Button>
                <Button type="button" variant="outline" onClick={sendOTP} disabled={loading} className="flex-1">
                  Resend OTP
                </Button>
              </div>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
