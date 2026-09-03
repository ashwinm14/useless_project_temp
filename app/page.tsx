"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#f7f1e8] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-4xl text-center">

        {/* Biscuit */}
        <div className="text-7xl md:text-8xl mb-6">
          🍪
        </div>

        {/* Logo */}
        <p className="text-sm md:text-base font-black tracking-[0.35em] text-orange-600">
          BITECOUNT
        </p>

        {/* Heading */}
        <h1 className="mt-5 text-5xl md:text-8xl font-black tracking-tight leading-[0.9]">
          HOW MANY
          <br />
          BITES ARE LEFT?
        </h1>

        {/* Description */}
        <p className="mt-8 max-w-2xl mx-auto text-lg md:text-xl text-neutral-600 leading-relaxed">
          Finally, technology has solved the question nobody asked.
          Use your camera to calculate how many bites remain in your
          biscuit.
        </p>

        {/* Button */}
        <button
          onClick={() => router.push("/experiment")}
          className="mt-10 px-9 py-5 bg-neutral-900 text-white
          rounded-full font-black text-lg
          hover:bg-orange-600 hover:scale-105
          transition-all duration-200"
        >
          START EXPERIMENT →
        </button>

        {/* Footer joke */}
        <p className="mt-10 text-sm text-neutral-400">
          Powered by unnecessarily advanced technology.
        </p>

      </div>
    </main>
  );
}