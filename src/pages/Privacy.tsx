import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


const Privacy = () => {
  return (
    <div className="min-h-screen bg-atmospheric relative overflow-hidden">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 h-96 w-96 rounded-full bg-gradient-to-br from-purple-500/15 to-pink-500/15 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/15 to-cyan-500/15 blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-gradient-to-br from-brand/8 to-brand-2/8 blur-3xl animate-pulse" style={{ animationDelay: '3s' }} />
      </div>

      <Helmet>
        <title>Privacy Policy — BU_Basket</title>
        <meta name="description" content="Privacy Policy for BU_Basket campus marketplace. Learn how we protect your data and privacy." />
        <link rel="canonical" href="/privacy" />
      </Helmet>

      <Navbar />

      <main className="relative z-10 container mx-auto px-4 py-12 max-w-4xl">
        <div className="space-y-8">
          {/* Header with emoji and gradient */}
          <div className="text-center space-y-4">
            <div className="text-6xl mb-4 animate-bounce">🔒</div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              Privacy <span className="text-gradient-primary">Policy</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <Card className="group relative overflow-hidden rounded-3xl border-2 border-transparent bg-card hover:border-brand/30 shadow-lg hover:shadow-2xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-brand/5 to-brand-2/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 text-xl">
                <span className="text-2xl">📋</span>
                Introduction
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative">
              <p className="text-foreground/90 leading-relaxed">
                Welcome to BU_Basket ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our campus marketplace platform.
              </p>
              <p className="text-foreground/90 leading-relaxed">
                By using BU_Basket, you agree to the collection and use of information in accordance with this policy.
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden rounded-3xl border-2 border-transparent bg-card hover:border-brand/30 shadow-lg hover:shadow-2xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 text-xl">
                <span className="text-2xl">📝</span>
                Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 relative">
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="text-xl">👤</span>
                  Personal Information
                </h3>
                <ul className="list-disc list-inside space-y-2 text-foreground/80">
                  <li>College email address (for verification and account creation)</li>
                  <li>Name and profile information</li>
                  <li>Contact information (phone number, if provided)</li>
                  <li>Academic information (university, graduation year)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="text-xl">📊</span>
                  Usage Information
                </h3>
                <ul className="list-disc list-inside space-y-2 text-foreground/80">
                  <li>Listings you create, view, or interact with</li>
                  <li>Messages and communications through our platform</li>
                  <li>Search queries and browsing behavior</li>
                  <li>Device information and IP address</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden rounded-3xl border-2 border-transparent bg-card hover:border-brand/30 shadow-lg hover:shadow-2xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 text-xl">
                <span className="text-2xl">🎯</span>
                How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <ul className="list-disc list-inside space-y-2 text-foreground/80">
                <li>Verify your student status and maintain platform security</li>
                <li>Facilitate transactions between buyers and sellers</li>
                <li>Provide customer support and respond to inquiries</li>
                <li>Improve our services and user experience</li>
                <li>Send important notifications about your account or transactions</li>
                <li>Prevent fraud and ensure platform safety</li>
                <li>Comply with legal obligations</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden rounded-3xl border-2 border-transparent bg-card hover:border-brand/30 shadow-lg hover:shadow-2xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 text-xl">
                <span className="text-2xl">🤝</span>
                Information Sharing and Disclosure
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative">
              <p className="text-foreground/90 leading-relaxed">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground/80">
                <li><strong>With other users:</strong> Your profile information and listings are visible to other verified students</li>
                <li><strong>Service providers:</strong> Third-party services that help us operate our platform (hosting, analytics, etc.)</li>
                <li><strong>Legal requirements:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>Business transfers:</strong> In case of merger, acquisition, or sale of assets</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden rounded-3xl border-2 border-transparent bg-card hover:border-brand/30 shadow-lg hover:shadow-2xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 text-xl">
                <span className="text-2xl">🔐</span>
                Data Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative">
              <p className="text-foreground/90 leading-relaxed">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground/80">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication measures</li>
                <li>Secure hosting infrastructure</li>
              </ul>
              <p className="text-foreground/90 leading-relaxed">
                However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden rounded-3xl border-2 border-transparent bg-card hover:border-brand/30 shadow-lg hover:shadow-2xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 text-xl">
                <span className="text-2xl">⚖️</span>
                Your Rights and Choices
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <ul className="list-disc list-inside space-y-2 text-foreground/80">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and personal data</li>
                <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Cookies:</strong> Manage cookie preferences through your browser settings</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden rounded-3xl border-2 border-transparent bg-card hover:border-brand/30 shadow-lg hover:shadow-2xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 text-xl">
                <span className="text-2xl">🎓</span>
                Student Privacy Protection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative">
              <p className="text-foreground/90 leading-relaxed">
                As a student-focused platform, we take additional measures to protect student privacy:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground/80">
                <li>Email verification ensures only verified students can access the platform</li>
                <li>Limited data collection focused on platform functionality</li>
                <li>No sharing of academic records or sensitive student information</li>
                <li>Compliance with FERPA and other student privacy regulations</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden rounded-3xl border-2 border-transparent bg-card hover:border-brand/30 shadow-lg hover:shadow-2xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 text-xl">
                <span className="text-2xl">🍪</span>
                Cookies and Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative">
              <p className="text-foreground/90 leading-relaxed">
                We use cookies and similar technologies to enhance your experience:
              </p>
              <ul className="list-disc list-inside space-y-2 text-foreground/80">
                <li><strong>Essential cookies:</strong> Required for basic platform functionality</li>
                <li><strong>Analytics cookies:</strong> Help us understand how users interact with our platform</li>
                <li><strong>Preference cookies:</strong> Remember your settings and preferences</li>
              </ul>
              <p className="text-foreground/90 leading-relaxed">
                You can control cookie settings through your browser, but disabling certain cookies may affect platform functionality.
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden rounded-3xl border-2 border-transparent bg-card hover:border-brand/30 shadow-lg hover:shadow-2xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 text-xl">
                <span className="text-2xl">💾</span>
                Data Retention
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-foreground/90 leading-relaxed">
                We retain your personal information for as long as necessary to provide our services and comply with legal obligations. When you delete your account, we will remove your personal information within 30 days, except where retention is required by law.
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden rounded-3xl border-2 border-transparent bg-card hover:border-brand/30 shadow-lg hover:shadow-2xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 text-xl">
                <span className="text-2xl">👶</span>
                Children's Privacy
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-foreground/90 leading-relaxed">
                Our platform is designed for college students (typically 18+). We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly.
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden rounded-3xl border-2 border-transparent bg-card hover:border-brand/30 shadow-lg hover:shadow-2xl transition-all duration-500">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 text-xl">
                <span className="text-2xl">🔄</span>
                Changes to This Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              <p className="text-foreground/90 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.
              </p>
            </CardContent>
          </Card>

          <Card className="group relative overflow-hidden rounded-3xl border-2 border-brand/40 bg-gradient-to-br from-brand/10 via-card to-brand-2/10 shadow-2xl hover:shadow-glow transition-all duration-500">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-primary opacity-20 blur-3xl animate-pulse" />
            <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-gradient-success opacity-20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            <CardHeader className="relative">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <span className="text-3xl">📧</span>
                Contact Us
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 relative">
              <p className="text-foreground/90 leading-relaxed">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="relative overflow-hidden rounded-2xl border-2 border-brand/30 bg-background/50 backdrop-blur-sm p-6 shadow-lg">
                <p className="text-foreground/90 mb-2"><strong className="text-brand">📧 Email:</strong> bubasketdev@gmail.com</p>
                <p className="text-foreground/90 mb-2"><strong className="text-brand">📍 Address:</strong> Bennett University Campus, Greater Noida</p>
                <p className="text-foreground/90"><strong className="text-brand">⏱️ Response Time:</strong> We aim to respond within 48 hours</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Privacy;