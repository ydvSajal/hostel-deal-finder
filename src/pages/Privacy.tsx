import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";


const Privacy = () => {
  return (
    <div className="min-h-screen bg-atmospheric">
      {/* Floating orbs for visual interest */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-brand/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -left-32 w-64 h-64 bg-brand-2/4 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-success/3 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      <Helmet>
        <title>Privacy Policy — BU_Basket</title>
        <meta name="description" content="Privacy Policy for BU_Basket campus marketplace. Learn how we protect your data and privacy." />
        <link rel="canonical" href="/privacy" />
      </Helmet>

      <Navbar />

      <main className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">Privacy Policy</h1>
            <p className="text-lg text-gray-600">
              Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Introduction</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Welcome to BU_Basket ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our campus marketplace platform.
              </p>
              <p className="text-gray-700">
                By using BU_Basket, you agree to the collection and use of information in accordance with this policy.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>College email address (for verification and account creation)</li>
                  <li>Name and profile information</li>
                  <li>Contact information (phone number, if provided)</li>
                  <li>Academic information (university, graduation year)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Usage Information</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Listings you create, view, or interact with</li>
                  <li>Messages and communications through our platform</li>
                  <li>Search queries and browsing behavior</li>
                  <li>Device information and IP address</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
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

          <Card>
            <CardHeader>
              <CardTitle>Information Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>With other users:</strong> Your profile information and listings are visible to other verified students</li>
                <li><strong>Service providers:</strong> Third-party services that help us operate our platform (hosting, analytics, etc.)</li>
                <li><strong>Legal requirements:</strong> When required by law or to protect our rights and safety</li>
                <li><strong>Business transfers:</strong> In case of merger, acquisition, or sale of assets</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication measures</li>
                <li>Secure hosting infrastructure</li>
              </ul>
              <p className="text-gray-700">
                However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Rights and Choices</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your account and personal data</li>
                <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                <li><strong>Cookies:</strong> Manage cookie preferences through your browser settings</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Student Privacy Protection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                As a student-focused platform, we take additional measures to protect student privacy:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>Email verification ensures only verified students can access the platform</li>
                <li>Limited data collection focused on platform functionality</li>
                <li>No sharing of academic records or sensitive student information</li>
                <li>Compliance with FERPA and other student privacy regulations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                We use cookies and similar technologies to enhance your experience:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li><strong>Essential cookies:</strong> Required for basic platform functionality</li>
                <li><strong>Analytics cookies:</strong> Help us understand how users interact with our platform</li>
                <li><strong>Preference cookies:</strong> Remember your settings and preferences</li>
              </ul>
              <p className="text-gray-700">
                You can control cookie settings through your browser, but disabling certain cookies may affect platform functionality.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Retention</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                We retain your personal information for as long as necessary to provide our services and comply with legal obligations. When you delete your account, we will remove your personal information within 30 days, except where retention is required by law.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Our platform is designed for college students (typically 18+). We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will take steps to delete it promptly.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                If you have any questions about this Privacy Policy or our privacy practices, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700"><strong>Email:</strong> bubasketdev@gmail.com </p>
                <p className="text-gray-700"><strong>Address:</strong> Bennett University Campus, GreaterNoida</p>
                <p className="text-gray-700"><strong>Response Time:</strong> We aim to respond within 48 hours</p>
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