import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { config } from "@/lib/config";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);

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

  const handleResendConfirmation = async () => {
    if (!email || !isCollegeEmail(email)) {
      toast({
        title: "Enter your college email",
        description: `Please enter your @${config.collegeEmailDomain} email address first.`,
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: config.emailRedirectUrl
        }
      });
      
      if (error) throw error;
      
      toast({
        title: "Confirmation email resent! 📧",
        description: "Check your college email for the verification link.",
      });
    } catch (err: unknown) {
      toast({
        title: "Error resending email",
        description: err instanceof Error ? err.message : "Failed to resend confirmation email.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCollegeEmail(email)) {
      toast({
        title: "Use your college email",
        description: `Only addresses ending with @${config.collegeEmailDomain} are allowed.`,
        variant: "destructive"
      });
      return;
    }
    if (password.length < 8) {
      toast({ 
        title: "Password too short", 
        description: "Use at least 8 characters.",
        variant: "destructive" 
      });
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { 
            emailRedirectTo: config.emailRedirectUrl,
            data: {
              display_name: email.split('@')[0],
              college_email: email,
              college_domain: 'bennett.edu.in'
            }
          },
        });
        if (error) throw error;
        
        if (data.user && !data.session) {
          toast({
            title: "Verification email sent! 📧",
            description: "We've sent a confirmation link to your college email. Click the button in the email to verify your account and access BU_Basket.",
          });
          setShowResendButton(true);
        } else if (data.session) {
          toast({
            title: "Welcome to BU_Basket! 🎉",
            description: "Account created and verified successfully!",
          });
          navigate("/", { replace: true });
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        if (data.session?.user) {
          if (!data.user.email_confirmed_at) {
            toast({
              title: "Email not verified",
              description: "Please check your email and click the verification link before logging in.",
              variant: "destructive"
            });
            return;
          }
          
          toast({
            title: "Welcome back! 👋",
            description: "You're now logged in.",
          });
          navigate("/", { replace: true });
        }
      }
    } catch (err: unknown) {
      let msg = "Something went wrong";
      const errorMessage = err instanceof Error ? err.message : "";
      if (errorMessage.includes("Invalid login credentials")) {
        msg = "Invalid email or password. Make sure your email is verified.";
      } else if (errorMessage.includes("Email not confirmed")) {
        msg = "Please check your email and click the verification link first.";
      } else if (errorMessage.includes("User already registered")) {
        msg = "This email is already registered. Try logging in instead.";
      } else if (errorMessage.includes("Signup not allowed")) {
        msg = "Account creation is currently restricted to verified college emails.";
      } else {
        msg = errorMessage || "Something went wrong";
      }
      
      toast({ 
        title: "Authentication error", 
        description: msg,
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
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
        <h1 className="mb-2 text-3xl font-bold">{mode === "login" ? "Login" : "Create your account"}</h1>
        <p className="mb-6 text-muted-foreground">
          Only college emails ending with <strong>@{config.collegeEmailDomain}</strong> are allowed. Verification required.
        </p>
        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
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
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>
              {loading ? "Please wait…" : mode === "login" ? "Continue" : "Create account"}
            </Button>
          </form>
          
          {showResendButton && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">
                Didn't receive the email? Check your spam folder or resend it.
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleResendConfirmation}
                disabled={loading}
                className="w-full"
              >
                Resend confirmation email
              </Button>
            </div>
          )}
          <div className="mt-4 text-center text-sm">
            {mode === "login" ? (
              <button className="underline" onClick={() => setMode("signup")}>
                New here? Create an account
              </button>
            ) : (
              <button className="underline" onClick={() => setMode("login")}>
                Already have an account? Log in
              </button>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
