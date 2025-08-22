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

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
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

  const isCollegeEmail = (val: string) => /@bennett\.edu\.in$/i.test(val.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCollegeEmail(email)) {
      toast({
        title: "Use your college email",
        description: "Only addresses ending with @bennett.edu.in are allowed.",
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
        const redirectUrl = `${window.location.origin}/`;
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { 
            emailRedirectTo: redirectUrl,
            data: {
              display_name: email.split('@')[0]
            }
          },
        });
        if (error) throw error;
        
        if (data.user && !data.user.email_confirmed_at) {
          toast({
            title: "Check your inbox",
            description: "We sent a verification link to your college email.",
          });
        } else {
          toast({
            title: "Account created!",
            description: "You can now log in.",
          });
          setMode("login");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        
        if (data.session?.user) {
          toast({
            title: "Welcome back!",
            description: "You're now logged in.",
          });
          navigate("/", { replace: true });
        }
      }
    } catch (err: any) {
      let msg = "Something went wrong";
      if (err.message.includes("Invalid login credentials")) {
        msg = "Invalid email or password";
      } else if (err.message.includes("Email not confirmed")) {
        msg = "Please check your email and click the verification link";
      } else if (err.message.includes("User already registered")) {
        msg = "This email is already registered. Try logging in instead.";
      } else {
        msg = err.message;
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
          Only college emails ending with <strong>@bennett.edu.in</strong> are allowed. Verification required.
        </p>
        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">College email</Label>
              <Input
                id="email"
                type="email"
                inputMode="email"
                placeholder="you@bennett.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                pattern=".*@bennett\.edu\.in"
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
