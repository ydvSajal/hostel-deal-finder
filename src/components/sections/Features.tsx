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
    <section className="mx-auto max-w-6xl px-4 py-14">
      <h2 className="mb-2 text-center text-3xl font-bold tracking-tight">Hostel waale <span className="text-gradient-primary">BU_Basket</span> kyun?</h2>
      <p className="mb-8 text-center text-muted-foreground">Campus ke andar hi deals — fast, friendly, aur bilkul simple.</p>
      <div className="grid gap-6 md:grid-cols-3">
        {features.map(({ title, desc, Icon }) => (
          <div key={title} className="rounded-xl border bg-card p-6 shadow-sm backdrop-blur">
            <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
              <Icon className="h-5 w-5 text-[hsl(var(--brand-2))]" />
            </div>
            <h3 className="mb-1 font-semibold">{title}</h3>
            <p className="text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;
