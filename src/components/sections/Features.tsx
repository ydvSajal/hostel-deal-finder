import { BookOpen, ShoppingBasket, Users } from "lucide-react";

const features = [
  {
    title: "Books & Notes",
    desc: "Assignment se exam tak — sab kuch yahan milta hai.",
    Icon: BookOpen,
    gradient: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-500/10 to-pink-500/10",
    emoji: "📚"
  },
  {
    title: "Daily Essentials",
    desc: "Bucket, hanger, Maggie — hostel life ke sab items.",
    Icon: ShoppingBasket,
    gradient: "from-pink-500 to-orange-500",
    bgGradient: "from-pink-500/10 to-orange-500/10",
    emoji: "🛒"
  },
  {
    title: "Bhai-Chara Deals",
    desc: "Seedha students se deal — na middleman, na extra drama.",
    Icon: Users,
    gradient: "from-blue-500 to-purple-500",
    bgGradient: "from-blue-500/10 to-purple-500/10",
    emoji: "🤝"
  },
];

const Features = () => {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-24">
      {/* Animated background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 h-96 w-96 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>
      
      <div className="relative">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl md:text-5xl font-extrabold tracking-tight">
            Hostel waale <span className="text-gradient-primary">BU_Basket</span> kyun?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Campus ke andar hi deals — fast, friendly, aur bilkul simple.</p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3">
          {features.map(({ title, desc, Icon, gradient, bgGradient, emoji }, idx) => (
            <div 
              key={title} 
              className="group relative overflow-hidden rounded-3xl border-2 border-transparent bg-card p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-105 hover:border-brand/50"
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              {/* Gradient background on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Animated glow orb */}
              <div className={`absolute -right-12 -top-12 h-40 w-40 rounded-full bg-gradient-to-br ${gradient} opacity-10 blur-2xl transition-all duration-500 group-hover:opacity-30 group-hover:scale-150`} />
              
              <div className="relative z-10">
                {/* Large emoji badge */}
                <div className="mb-6 relative inline-block">
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient} rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity`} />
                  <div className="relative h-20 w-20 flex items-center justify-center rounded-2xl bg-gradient-to-br from-background/80 to-background/40 backdrop-blur-sm border-2 border-white/20 shadow-xl">
                    <span className="text-4xl">{emoji}</span>
                  </div>
                </div>
                
                <h3 className="mb-3 text-2xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">{title}</h3>
                <p className="text-muted-foreground leading-relaxed text-base">{desc}</p>
                
                {/* Decorative icon */}
                <div className="mt-6 flex items-center gap-2 text-brand/60 group-hover:text-brand transition-colors">
                  <Icon className="h-5 w-5" />
                  <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${gradient} opacity-50`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
