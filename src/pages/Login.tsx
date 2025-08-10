import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const Login = () => {
  const handleEmailLogin = () => {
    toast({
      title: "Connect Supabase to enable auth",
      description: "We’ll restrict sign-ups to @bennett.edu.in and send verification emails once Supabase is connected.",
    });
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
        <h1 className="mb-2 text-3xl font-bold">Login / Sign up</h1>
        <p className="mb-6 text-muted-foreground">Only college emails ending with <strong>@bennett.edu.in</strong> are allowed. Verification required.</p>
        <div className="rounded-2xl border bg-card p-8 shadow-sm">
          <Button onClick={handleEmailLogin} variant="hero" size="lg" className="w-full">
            <Mail className="mr-2 h-4 w-4" /> Continue with College Email
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
