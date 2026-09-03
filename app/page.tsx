"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden">
      
      {/* Floating Cookies Background */}
      <div className="absolute inset-0 z-[-1] pointer-events-none opacity-20">
        <div className="absolute top-[10%] left-[10%] text-9xl animate-float">🍪</div>
        <div className="absolute bottom-[20%] right-[10%] text-8xl animate-float-delayed blur-sm">🍪</div>
        <div className="absolute top-[30%] right-[20%] text-6xl animate-float blur-md">🍪</div>
      </div>

      <div className="w-full max-w-4xl text-center z-10 glass-panel rounded-[3rem] p-12 md:p-24 relative">

        {/* Logo */}
        <p className="text-sm md:text-lg font-black tracking-[0.5em] text-orange-500 uppercase">
          Project Bitecount
        </p>

        {/* Heading */}
        <h1 className="mt-8 text-6xl md:text-9xl font-black tracking-tighter leading-[0.85] text-transparent bg-clip-text bg-gradient-to-br from-white via-orange-100 to-orange-500">
          HOW MANY
          <br />
          BITES ARE LEFT?
        </h1>

        {/* Description */}
        <p className="mt-10 max-w-2xl mx-auto text-lg md:text-2xl text-neutral-400 leading-relaxed font-light">
          Finally, technology has solved the question nobody asked.
          Use advanced AI vision to mathematically dissect your biscuit.
        </p>

        {/* Button */}
        <button
          onClick={() => router.push("/experiment")}
          className="mt-12 px-12 py-6 bg-orange-600 text-white rounded-full font-black text-xl md:text-2xl tracking-widest glow-button"
        >
          START SCAN →
        </button>

        {/* Footer joke */}
        <p className="mt-12 text-sm text-neutral-600 font-mono tracking-widest uppercase">
          System Online // Gemini Vision Activated
        </p>

      </div>
    </main>
  );
}