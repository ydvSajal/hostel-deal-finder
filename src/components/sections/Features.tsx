import { BookText, Boxes, Handshake } from "lucide-react";

const features = [
  {
    title: "Books & Notes",
    desc: "Assignment se exam tak — sab kuch yahan milta hai.",
    Icon: BookText,
  },
  {
    title: "Daily Essentials",
    desc: "Bucket, hanger, Maggie — hostel life ke sab items.",
    Icon: Boxes,
  },
  {
    title: "Bhai-Chara Deals",
    desc: "Seedha students se deal — na middleman, na extra drama.",
    Icon: Handshake,
  },
];

const Features = () => {
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-20">
      <div className="absolute inset-0 bg-gradient-radial from-brand/5 via-transparent to-transparent blur-3xl" />
      <div className="relative">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-4xl font-bold tracking-tight">
            Hostel waale <span className="text-gradient-primary">BU_Basket</span> kyun?
          </h2>
          <p className="text-lg text-muted-foreground">Campus ke andar hi deals — fast, friendly, aur bilkul simple.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map(({ title, desc, Icon }) => (
            <div 
              key={title} 
              className="group relative overflow-hidden rounded-2xl border-2 border-border/50 bg-card shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-sm transition-smooth hover-lift hover:shadow-[0_12px_40px_rgb(0,0,0,0.18)] hover:border-brand/50"
            >
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-primary opacity-5 blur-2xl transition-smooth group-hover:opacity-10" />
              <div className="relative">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
                  <Icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="mb-2 text-xl font-bold">{title}</h3>
                <p className="text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
