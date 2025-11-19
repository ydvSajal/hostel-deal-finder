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
    <div className="min-h-screen bg-atmospheric relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 h-96 w-96 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-brand/10 to-brand-2/10 blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
      </div>
      
      <Helmet>
        <title>Login — BU_Basket | Student Marketplace Access</title>
        <meta name="description" content="Login to BU_Basket with your @bennett.edu.in email. Secure OTP verification for verified students only. Access campus marketplace safely." />
        <meta name="keywords" content="BU login, student login, college email verification, OTP login, secure marketplace" />
        <link rel="canonical" href="https://bu-basket.com/login" />
        <meta property="og:title" content="Login to BU_Basket" />
        <meta property="og:description" content="Access BU's trusted student marketplace with your college email." />
      </Helmet>
      <Navbar />
      <main className="relative mx-auto max-w-xl px-4 py-16 sm:py-20">
        {/* Decorative sparkles */}
        <div className="absolute top-10 left-10 text-3xl animate-bounce">✨</div>
        <div className="absolute top-20 right-10 text-3xl animate-bounce" style={{ animationDelay: '0.5s' }}>⭐</div>
        
        <div className="relative overflow-hidden rounded-3xl border-2 border-brand/30 bg-gradient-to-br from-card/95 via-card/90 to-card/95 p-8 sm:p-12 shadow-2xl backdrop-blur-xl">
          {/* Floating gradient orbs */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 opacity-20 blur-3xl animate-pulse" />
          <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          
          {/* Sparkle decorations */}
          <div className="absolute top-6 right-6 text-2xl animate-bounce">✨</div>
          <div className="absolute bottom-6 left-6 text-2xl animate-bounce" style={{ animationDelay: '1s' }}>💫</div>
          
          <div className="relative z-10">
            {/* Large emoji header */}
            <div className="mb-6 text-center">
              <div className="text-6xl sm:text-7xl mb-4 animate-bounce">
                {!otpSent ? "🎓" : "📧"}
              </div>
              <h1 className="mb-3 text-3xl sm:text-4xl font-extrabold">
                {!otpSent ? "Welcome to " : "Verify Your "}
                <span className="text-gradient-primary">{!otpSent ? "BU_Basket" : "Email"}</span>
              </h1>
              <p className="text-lg text-muted-foreground">
                {!otpSent 
                  ? `Sign in with your @${config.collegeEmailDomain} email`
                  : `Enter the code sent to ${email}`
                }
              </p>
            </div>
            {!otpSent ? (
              <form onSubmit={(e) => { e.preventDefault(); sendOTP(); }} className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="email" className="text-sm font-semibold flex items-center gap-2">
                    📧 College Email
                  </Label>
                  <div className="relative">
                    <Input
                      id="email"
                      type="email"
                      inputMode="email"
                      placeholder={`you@${config.collegeEmailDomain}`}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      pattern={`.*@${config.collegeEmailDomain.replace('.', '\\.')}`}
                      className="h-14 rounded-2xl border-2 border-border/50 bg-background/50 backdrop-blur-sm transition-all duration-300 focus:border-brand focus:ring-4 focus:ring-brand/20 text-base pl-4 pr-4 hover:border-brand/50"
                    />
                  </div>
                </div>
                <Button 
                  type="submit" 
                  variant="hero" 
                  size="lg" 
                  className="w-full h-14 rounded-2xl shadow-2xl text-lg font-bold hover:scale-105 hover:shadow-glow transition-all duration-300" 
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span> Sending code...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      🚀 Send OTP
                    </span>
                  )}
                </Button>
                
                {/* Trust indicators */}
                <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground pt-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">🔒</span>
                    <span>Secure</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">⚡</span>
                    <span>Fast</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-lg">✓</span>
                    <span>Verified</span>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={verifyOTP} className="space-y-6">
                <div className="space-y-4">
                  <Label htmlFor="otp" className="text-base font-semibold text-center flex items-center justify-center gap-2">
                    🔐 Enter 6-digit code
                  </Label>
                  <div className="flex justify-center">
                    <InputOTP
                      value={otp}
                      onChange={setOtp}
                      maxLength={6}
                    >
                      <InputOTPGroup className="gap-2 sm:gap-3">
                        <InputOTPSlot index={0} className="h-16 w-12 sm:w-14 rounded-2xl border-2 !border-brand/40 bg-background/80 backdrop-blur-sm transition-all duration-300 focus:!border-brand focus:ring-4 focus:ring-brand/20 text-xl font-bold hover:!border-brand/60 shadow-md" />
                        <InputOTPSlot index={1} className="h-16 w-12 sm:w-14 rounded-2xl border-2 !border-brand/40 bg-background/80 backdrop-blur-sm transition-all duration-300 focus:!border-brand focus:ring-4 focus:ring-brand/20 text-xl font-bold hover:!border-brand/60 shadow-md" />
                        <InputOTPSlot index={2} className="h-16 w-12 sm:w-14 rounded-2xl border-2 !border-brand/40 bg-background/80 backdrop-blur-sm transition-all duration-300 focus:!border-brand focus:ring-4 focus:ring-brand/20 text-xl font-bold hover:!border-brand/60 shadow-md" />
                        <InputOTPSlot index={3} className="h-16 w-12 sm:w-14 rounded-2xl border-2 !border-brand/40 bg-background/80 backdrop-blur-sm transition-all duration-300 focus:!border-brand focus:ring-4 focus:ring-brand/20 text-xl font-bold hover:!border-brand/60 shadow-md" />
                        <InputOTPSlot index={4} className="h-16 w-12 sm:w-14 rounded-2xl border-2 !border-brand/40 bg-background/80 backdrop-blur-sm transition-all duration-300 focus:!border-brand focus:ring-4 focus:ring-brand/20 text-xl font-bold hover:!border-brand/60 shadow-md" />
                        <InputOTPSlot index={5} className="h-16 w-12 sm:w-14 rounded-2xl border-2 !border-brand/40 bg-background/80 backdrop-blur-sm transition-all duration-300 focus:!border-brand focus:ring-4 focus:ring-brand/20 text-xl font-bold hover:!border-brand/60 shadow-md" />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                </div>
                <Button 
                  type="submit" 
                  variant="hero" 
                  size="lg" 
                  className="w-full h-14 rounded-2xl shadow-2xl text-lg font-bold hover:scale-105 hover:shadow-glow transition-all duration-300" 
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span> Verifying...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      ✅ Login
                    </span>
                  )}
                </Button>
                <div className="flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="lg" 
                    onClick={handleBack} 
                    className="flex-1 h-12 rounded-2xl border-2 border-border/50 hover:bg-background/80 hover:border-brand/50 transition-all duration-300"
                  >
                    ← Back
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="lg" 
                    onClick={sendOTP} 
                    disabled={loading || !canResend} 
                    className="flex-1 h-12 rounded-2xl border-2 border-border/50 hover:bg-background/80 hover:border-brand/50 transition-all duration-300 disabled:opacity-50"
                  >
                    {canResend ? "🔄 Resend" : `⏱️ ${countdown}s`}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
        
        {/* Terms footer with icon */}
        <p className="mt-8 text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
          <span className="text-base">📋</span>
          By signing in, you agree to our terms of service
        </p>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
