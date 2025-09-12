import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatDiagnostic from "@/components/ChatDiagnostic";

const ChatDebug = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Chat Debug — BU_Basket</title>
      </Helmet>
      <Navbar />
      <main className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8">
        <h1 className="text-2xl font-bold mb-6">Chat Debug</h1>
        <ChatDiagnostic />
      </main>
      <Footer />
    </div>
  );
};

export default ChatDebug;