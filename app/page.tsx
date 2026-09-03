"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden">
      
      <div className="w-full max-w-4xl text-center neu-flat p-12 md:p-24 relative">

        {/* Logo */}
        <p className="text-sm md:text-lg font-black tracking-[0.5em] text-orange-600 uppercase drop-shadow-sm">
          Project Bitecount
        </p>

        {/* Heading */}
        <h1 className="mt-8 text-6xl md:text-9xl font-black tracking-tighter leading-[0.85] text-slate-700">
          HOW MANY
          <br />
          BITES ARE LEFT?
        </h1>

        {/* Description */}
        <p className="mt-10 max-w-2xl mx-auto text-lg md:text-2xl text-slate-500 leading-relaxed font-bold">
          Finally, technology has solved the question nobody asked.
          Use advanced AI vision to mathematically dissect your biscuit.
        </p>

        {/* Button */}
        <button
          onClick={() => router.push("/experiment")}
          className="mt-16 px-12 py-6 text-xl md:text-2xl uppercase tracking-widest neu-button"
        >
          Start Scan →
        </button>

        {/* Footer joke */}
        <p className="mt-16 text-sm text-slate-400 font-mono tracking-widest uppercase">
          System Online // Gemini Vision Activated
        </p>

      </div>
    </main>
  );
}