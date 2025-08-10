import { Helmet } from "react-helmet-async";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface Msg { id: number; sender: "me" | "seller"; text: string; }

const Chat = () => {
  const [messages, setMessages] = useState<Msg[]>([
    { id: 1, sender: "seller", text: "Hi! Item available. Where to meet?" },
  ]);
  const [value, setValue] = useState("");

  const send = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    setMessages((m) => [...m, { id: Date.now(), sender: "me", text: value.trim() }]);
    setValue("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Chat — BU_Basket</title>
        <meta name="description" content="Message sellers securely on BU_Basket once logged in with college email." />
        <link rel="canonical" href="/chat" />
      </Helmet>
      <Navbar />
      <main className="mx-auto flex h-[calc(100vh-8rem)] max-w-4xl flex-col px-4 py-6">
        <div className="mb-4 rounded-xl border bg-card p-4 shadow-sm">
          <h1 className="text-lg font-semibold">Chat Preview</h1>
          <p className="text-sm text-muted-foreground">Real-time chat will be enabled after authentication is connected.</p>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto rounded-xl border bg-card p-4">
          {messages.map((m) => (
            <div key={m.id} className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.sender === "me" ? "ml-auto bg-gradient-to-r from-[hsl(var(--brand))] to-[hsl(var(--brand-2))] text-primary-foreground" : "bg-secondary"}`}>
              {m.text}
            </div>
          ))}
        </div>
        <form onSubmit={send} className="mt-3 flex gap-2">
          <input
            className="flex-1 rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
            placeholder="Write a message..."
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <Button type="submit" variant="hero">Send</Button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default Chat;
