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
  const [countdown, setCountdown] = useState(0);
  const [canResend, setCanResend] = useState(true);

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

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (countdown === 0 && !canResend) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown, canResend]);

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
      // Check rate limiting
      const { data: rateLimitOk } = await supabase.rpc('check_otp_rate_limit', { 
        user_email: email.trim() 
      });
      
      if (!rateLimitOk) {
        toast({
          title: "Rate Limit Exceeded",
          description: "Too many OTP requests. Please wait 60 seconds before trying again.",
          variant: "destructive",
        });
        setLoading(false);
        setCountdown(60);
        setCanResend(false);
        return;
      }

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
      setCountdown(60);
      setCanResend(false);
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
    <div className="min-h-screen bg-atmospheric">
      <Helmet>
        <title>Login — BU_Basket</title>
        <meta name="description" content="Login or sign up using your @bennett.edu.in email to access BU_Basket." />
        <link rel="canonical" href="/login" />
      </Helmet>
      <Navbar />
      <main className="mx-auto max-w-xl px-4 py-20">
        <div className="relative overflow-hidden rounded-3xl border border-brand/20 bg-gradient-card p-10 shadow-elegant backdrop-blur-xl">
          <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full bg-gradient-primary opacity-10 blur-3xl" />
          <div className="relative">
            <div className="mb-8 text-center">
              <h1 className="mb-3 text-3xl font-bold">
                {!otpSent ? "Welcome to " : "Verify Your "}
                <span className="text-gradient-primary">{!otpSent ? "BU_Basket" : "Email"}</span>
              </h1>
              <p className="text-muted-foreground">
                {!otpSent 
                  ? `Sign in with your @${config.collegeEmailDomain} email`
                  : `Enter the code sent to ${email}`
                }
              </p>
            </div>
            {!otpSent ? (
              <form onSubmit={(e) => { e.preventDefault(); sendOTP(); }} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">College Email</Label>
                  <Input
                    id="email"
                    type="email"
                    inputMode="email"
                    placeholder={`you@${config.collegeEmailDomain}`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    pattern={`.*@${config.collegeEmailDomain.replace('.', '\\.')}`}
                    className="h-12 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm transition-smooth focus:border-brand focus:ring-brand/20"
                  />
                </div>
                <Button type="submit" variant="hero" size="lg" className="w-full rounded-xl shadow-glow" disabled={loading}>
                  {loading ? "Sending code..." : "Send OTP"}
                </Button>
              </form>
            ) : (
              <form onSubmit={verifyOTP} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="otp" className="text-sm font-medium text-center block">Enter 6-digit code</Label>
                  <div className="flex justify-center">
                    <InputOTP
                      value={otp}
                      onChange={setOtp}
                      maxLength={6}
                    >
                      <InputOTPGroup className="gap-2">
                        <InputOTPSlot index={0} className="h-14 w-12 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm transition-smooth focus:border-brand" />
                        <InputOTPSlot index={1} className="h-14 w-12 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm transition-smooth focus:border-brand" />
                        <InputOTPSlot index={2} className="h-14 w-12 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm transition-smooth focus:border-brand" />
                        <InputOTPSlot index={3} className="h-14 w-12 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm transition-smooth focus:border-brand" />
                        <InputOTPSlot index={4} className="h-14 w-12 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm transition-smooth focus:border-brand" />
                        <InputOTPSlot index={5} className="h-14 w-12 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm transition-smooth focus:border-brand" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
                <Button type="submit" variant="hero" size="lg" className="w-full rounded-xl shadow-glow" disabled={loading || otp.length !== 6}>
                  {loading ? "Verifying..." : "Login"}
                </Button>
                <div className="flex gap-3">
                  <Button type="button" variant="outline" size="lg" onClick={handleBack} className="flex-1 rounded-xl border-border/50 hover:bg-background/50">
                    Back
                  </Button>
                  <Button type="button" variant="outline" size="lg" onClick={sendOTP} disabled={loading || !canResend} className="flex-1 rounded-xl border-border/50 hover:bg-background/50">
                    {canResend ? "Resend" : `${countdown}s`}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          By signing in, you agree to our terms of service
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
