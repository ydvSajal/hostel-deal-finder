const steps = [
  { id: 1, title: "Account Banao", desc: "College email se sign up karo", icon: "🎓", color: "from-green-500 to-emerald-500" },
  { id: 2, title: "Cheezein Dalo ya Dhoondo", desc: "Jo bechna hai daalo, jo chahiye wo dhoondo", icon: "🔎", color: "from-blue-500 to-cyan-500" },
  { id: 3, title: "Deal Pakka Karo", desc: "Mess ya lobby mein milo, done deal", icon: "🙌", color: "from-orange-500 to-amber-500" },
];

const HowItWorks = () => {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-24 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-cyan-500/10 to-blue-500/10 blur-3xl animate-pulse" />
      </div>
      
      <div className="relative">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl md:text-5xl font-extrabold tracking-tight">
            Kaise Kaam Karta Hai? <span className="inline-block animate-bounce">🤔</span>
          </h2>
          <p className="text-lg text-muted-foreground">Teen simple steps mein deal complete karo!</p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3 relative">
          {/* Connection lines */}
          <div className="hidden md:block absolute top-20 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand/30 to-transparent" />
          
          {steps.map((s, idx) => (
            <article 
              key={s.id} 
              className="group relative"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div className="relative h-full rounded-3xl border-2 border-transparent bg-card p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:border-brand/40">
                {/* Animated background */}
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${s.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                <div className="relative z-10">
                  {/* Step number badge */}
                  <div className="mb-6 relative inline-block">
                    <div className={`absolute inset-0 bg-gradient-to-br ${s.color} rounded-2xl blur-lg opacity-50 group-hover:opacity-100 transition-opacity`} />
                    <div className={`relative h-16 w-16 flex items-center justify-center rounded-2xl bg-gradient-to-br ${s.color} shadow-xl`}>
                      <span className="text-3xl font-bold text-white">{s.id}</span>
                    </div>
                    {/* Large emoji overlay */}
                    <div className="absolute -right-2 -top-2 text-3xl">{s.icon}</div>
                  </div>
                  
                  <h3 className="mb-3 text-2xl font-bold">{s.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-base">{s.desc}</p>
                  
                  {/* Progress indicator */}
                  <div className="mt-6">
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${s.color} rounded-full group-hover:w-full w-0 transition-all duration-1000`} />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Arrow connector */}
              {idx < steps.length - 1 && (
                <div className="hidden md:flex absolute -right-4 top-20 z-20 items-center justify-center h-8 w-8 rounded-full bg-background border-2 border-brand/30 shadow-lg">
                  <span className="text-brand">→</span>
                </div>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
