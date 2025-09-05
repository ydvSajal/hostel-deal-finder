const steps = [
  { id: 1, title: "Account Banao", desc: "College email se sign up karo" },
  { id: 2, title: "Cheezein Dalo ya Dhoondo", desc: "Jo bechna hai daalo, jo chahiye wo dhoondo 🔎" },
  { id: 3, title: "Deal Pakka Karo", desc: "Mess ya lobby mein milo, done deal 🙌" },
];

const HowItWorks = () => {
  return (
    <section className="mx-auto max-w-6xl px-4 py-14">
      <h2 className="mb-8 text-center text-3xl font-bold tracking-tight">Kaise Kaam Karta Hai? 🤔</h2>
      <div className="grid gap-6 md:grid-cols-3">
        {steps.map((s) => (
          <article key={s.id} className="rounded-2xl border bg-card p-6 shadow-sm">
            <div className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-[hsl(var(--brand))] to-[hsl(var(--brand-2))] text-primary-foreground text-sm font-bold">
              {s.id}
            </div>
            <h3 className="mb-1 font-semibold">{s.title}</h3>
            <p className="text-sm text-muted-foreground">{s.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
