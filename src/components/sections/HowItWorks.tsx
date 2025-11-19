const steps = [
  { id: 1, title: "Account Banao", desc: "College email se sign up karo" },
  { id: 2, title: "Cheezein Dalo ya Dhoondo", desc: "Jo bechna hai daalo, jo chahiye wo dhoondo 🔎" },
  { id: 3, title: "Deal Pakka Karo", desc: "Mess ya lobby mein milo, done deal 🙌" },
];

const HowItWorks = () => {
  return (
    <section className="relative mx-auto max-w-6xl px-4 py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-radial from-brand-2/5 via-transparent to-transparent blur-3xl" />
      <div className="relative">
        <h2 className="mb-12 text-center text-4xl font-bold tracking-tight">
          Kaise Kaam Karta Hai? 🤔
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {steps.map((s, idx) => (
            <article 
              key={s.id} 
              className="group relative"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="relative h-full rounded-2xl border-2 border-border/50 bg-card p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)] backdrop-blur-sm transition-smooth hover-lift hover:shadow-[0_12px_40px_rgb(0,0,0,0.18)] hover:border-brand-2/50">
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-success opacity-5 blur-2xl transition-smooth group-hover:opacity-10" />
                <div className="relative">
                  <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-success text-lg font-bold text-primary-foreground shadow-glow">
                    {s.id}
                  </div>
                  <h3 className="mb-2 text-xl font-bold">{s.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute -right-4 top-1/2 z-10 h-0.5 w-8 bg-gradient-to-r from-brand-2/50 to-transparent" />
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
