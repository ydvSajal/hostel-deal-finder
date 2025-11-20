import { useEffect, useState } from "react";

const MobileHeroAnimation = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Animated gradient orbs */}
      <div 
        className={`absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-gradient-to-br from-purple-500/30 via-pink-500/20 to-transparent blur-3xl transition-all duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        style={{
          animation: 'float-1 8s ease-in-out infinite',
        }}
      />
      
      <div 
        className={`absolute top-1/2 right-1/4 w-72 h-72 rounded-full bg-gradient-to-br from-blue-500/30 via-cyan-500/20 to-transparent blur-3xl transition-all duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        style={{
          animation: 'float-2 10s ease-in-out infinite',
          animationDelay: '1s'
        }}
      />
      
      <div 
        className={`absolute bottom-1/4 left-1/3 w-56 h-56 rounded-full bg-gradient-to-br from-green-500/30 via-emerald-500/20 to-transparent blur-3xl transition-all duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        style={{
          animation: 'float-3 12s ease-in-out infinite',
          animationDelay: '2s'
        }}
      />

      {/* Floating Emoji Icons */}
      {/* Money Bag 💰 */}
      <div 
        className={`absolute top-[15%] left-[10%] text-4xl transition-all duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        style={{
          animation: 'float-icon-1 6s ease-in-out infinite',
        }}
      >
        💰
      </div>

      <div 
        className={`absolute bottom-[25%] right-[15%] text-3xl transition-all duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        style={{
          animation: 'float-icon-2 7s ease-in-out infinite',
          animationDelay: '1.5s'
        }}
      >
        💰
      </div>

      {/* Store/Shop 🏪 */}
      <div 
        className={`absolute top-[35%] right-[8%] text-5xl transition-all duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        style={{
          animation: 'float-icon-3 8s ease-in-out infinite',
          animationDelay: '0.5s'
        }}
      >
        🏪
      </div>

      <div 
        className={`absolute bottom-[40%] left-[12%] text-4xl transition-all duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        style={{
          animation: 'float-icon-1 9s ease-in-out infinite',
          animationDelay: '2s'
        }}
      >
        🛒
      </div>

      {/* Sparkles ✨ */}
      <div 
        className={`absolute top-[20%] right-[20%] text-3xl transition-all duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        style={{
          animation: 'sparkle-1 4s ease-in-out infinite',
        }}
      >
        ✨
      </div>

      <div 
        className={`absolute top-[50%] left-[8%] text-2xl transition-all duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        style={{
          animation: 'sparkle-2 5s ease-in-out infinite',
          animationDelay: '1s'
        }}
      >
        ✨
      </div>

      <div 
        className={`absolute bottom-[15%] right-[25%] text-3xl transition-all duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        style={{
          animation: 'sparkle-1 4.5s ease-in-out infinite',
          animationDelay: '2.5s'
        }}
      >
        ✨
      </div>

      {/* Shopping Bags 🛍️ */}
      <div 
        className={`absolute top-[45%] right-[12%] text-3xl transition-all duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        style={{
          animation: 'float-icon-2 7.5s ease-in-out infinite',
          animationDelay: '3s'
        }}
      >
        🛍️
      </div>

      {/* Books 📚 */}
      <div 
        className={`absolute bottom-[35%] right-[8%] text-3xl transition-all duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        style={{
          animation: 'float-icon-3 8.5s ease-in-out infinite',
          animationDelay: '1s'
        }}
      >
        📚
      </div>

      {/* Rocket 🚀 */}
      <div 
        className={`absolute top-[60%] left-[15%] text-3xl transition-all duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        style={{
          animation: 'rocket-float 10s ease-in-out infinite',
        }}
      >
        🚀
      </div>

      {/* Fire 🔥 */}
      <div 
        className={`absolute top-[25%] left-[20%] text-2xl transition-all duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        style={{
          animation: 'fire-flicker 2s ease-in-out infinite',
        }}
      >
        🔥
      </div>

      {/* Subtle shimmer effect */}
      <div 
        className={`absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent transition-all duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}
        style={{
          animation: 'shimmer 10s ease-in-out infinite',
        }}
      />

      <style>{`
        @keyframes float-1 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(30px, -20px) scale(1.1);
          }
          50% {
            transform: translate(-20px, -40px) scale(0.9);
          }
          75% {
            transform: translate(-30px, -10px) scale(1.05);
          }
        }

        @keyframes float-2 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          30% {
            transform: translate(-25px, 30px) scale(1.15);
          }
          60% {
            transform: translate(15px, -25px) scale(0.85);
          }
          80% {
            transform: translate(25px, 15px) scale(1.1);
          }
        }

        @keyframes float-3 {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          20% {
            transform: translate(20px, 25px) scale(0.95);
          }
          50% {
            transform: translate(-30px, -15px) scale(1.1);
          }
          70% {
            transform: translate(10px, 20px) scale(0.9);
          }
        }

        @keyframes float-icon-1 {
          0%, 100% {
            transform: translateY(0px) translateX(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-15px) translateX(10px) rotate(5deg);
          }
          50% {
            transform: translateY(-30px) translateX(0px) rotate(0deg);
          }
          75% {
            transform: translateY(-15px) translateX(-10px) rotate(-5deg);
          }
        }

        @keyframes float-icon-2 {
          0%, 100% {
            transform: translateY(0px) translateX(0px) rotate(0deg) scale(1);
          }
          33% {
            transform: translateY(-20px) translateX(-12px) rotate(-8deg) scale(1.1);
          }
          66% {
            transform: translateY(-10px) translateX(12px) rotate(8deg) scale(0.95);
          }
        }

        @keyframes float-icon-3 {
          0%, 100% {
            transform: translateY(0px) translateX(0px) scale(1);
          }
          20% {
            transform: translateY(-10px) translateX(8px) scale(1.05);
          }
          40% {
            transform: translateY(-25px) translateX(-5px) scale(0.95);
          }
          60% {
            transform: translateY(-15px) translateX(10px) scale(1.08);
          }
          80% {
            transform: translateY(-5px) translateX(-8px) scale(0.98);
          }
        }

        @keyframes sparkle-1 {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            opacity: 0.8;
          }
          25% {
            transform: scale(1.3) rotate(90deg);
            opacity: 1;
          }
          50% {
            transform: scale(0.8) rotate(180deg);
            opacity: 0.6;
          }
          75% {
            transform: scale(1.2) rotate(270deg);
            opacity: 1;
          }
        }

        @keyframes sparkle-2 {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            opacity: 0.7;
          }
          33% {
            transform: scale(1.4) rotate(120deg);
            opacity: 1;
          }
          66% {
            transform: scale(0.9) rotate(240deg);
            opacity: 0.5;
          }
        }

        @keyframes rocket-float {
          0%, 100% {
            transform: translateY(0px) translateX(0px) rotate(-45deg);
          }
          25% {
            transform: translateY(-40px) translateX(20px) rotate(-35deg);
          }
          50% {
            transform: translateY(-80px) translateX(0px) rotate(-45deg);
          }
          75% {
            transform: translateY(-40px) translateX(-20px) rotate(-55deg);
          }
        }

        @keyframes fire-flicker {
          0%, 100% {
            transform: scale(1) translateY(0px);
            opacity: 1;
          }
          25% {
            transform: scale(1.1) translateY(-3px);
            opacity: 0.9;
          }
          50% {
            transform: scale(0.95) translateY(-1px);
            opacity: 1;
          }
          75% {
            transform: scale(1.05) translateY(-2px);
            opacity: 0.95;
          }
        }

        @keyframes shimmer {
          0%, 100% {
            transform: translateY(-100%);
          }
          50% {
            transform: translateY(100%);
          }
        }
      `}</style>
    </div>
  );
};

export default MobileHeroAnimation;
