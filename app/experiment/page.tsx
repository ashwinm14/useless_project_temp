"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Camera from "@/components/Camera";

export default function ExperimentPage() {
  const router = useRouter();

  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);

  function handleCapture(image: string) {
    if (!originalImage) {
      setOriginalImage(image);
      return;
    }

    setCurrentImage(image);
  }

  function resetExperiment() {
    setOriginalImage(null);
    setCurrentImage(null);

    localStorage.removeItem("bitecount-original");
    localStorage.removeItem("bitecount-current");
  }

  function calculateResult() {
    if (!originalImage || !currentImage) {
      return;
    }

    try {
      localStorage.setItem("bitecount-original", originalImage);
      localStorage.setItem("bitecount-current", currentImage);
    } catch (e) {
      console.warn("Could not save images to localStorage (they might be too large)", e);
    }

    router.push("/result");
  }

  return (
    <main className="min-h-screen px-5 py-8 relative overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 z-[-1] pointer-events-none opacity-10">
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-orange-500 blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto z-10 relative">
        {/* Header */}
        <header className="mb-10 text-center">
          <p className="text-sm font-black tracking-[0.4em] text-orange-500 uppercase">
            Bitecount Sequence
          </p>
          <h1 className="mt-3 text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-400">
            Biscuit Experiment
          </h1>
        </header>

        {/* Progress */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className={`rounded-3xl p-5 font-bold transition-all duration-500 ${
              originalImage
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "glass-panel text-orange-400 border border-orange-500/50 shadow-[0_0_20px_rgba(255,107,0,0.2)]"
            }`}
          >
            <p className="text-xs uppercase tracking-widest opacity-80">Phase 1</p>
            <p className="mt-1 text-lg">Whole Biscuit</p>
          </div>

          <div className={`rounded-3xl p-5 font-bold transition-all duration-500 ${
              currentImage
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : originalImage
                ? "glass-panel text-orange-400 border border-orange-500/50 shadow-[0_0_20px_rgba(255,107,0,0.2)]"
                : "glass-panel text-neutral-500 opacity-50"
            }`}
          >
            <p className="text-xs uppercase tracking-widest opacity-80">Phase 2</p>
            <p className="mt-1 text-lg">After Bite</p>
          </div>
        </div>

        {/* Instructions */}
        {!originalImage && (
          <div className="glass-panel rounded-3xl p-8 mb-8 text-center">
            <div className="text-5xl animate-bounce">🍪</div>
            <h2 className="mt-6 text-3xl font-black text-white">Target Acquired</h2>
            <p className="mt-3 text-neutral-400 text-lg">
              Place the whole biscuit inside the scanner frame. Ensure maximum visibility.
            </p>
          </div>
        )}

        {originalImage && !currentImage && (
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-3xl p-8 mb-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-pulse" />
            <div className="text-5xl">😋</div>
            <h2 className="mt-6 text-3xl font-black text-orange-400">INITIATE BITE</h2>
            <p className="mt-3 text-neutral-300 text-lg">
              Take exactly one bite. Return the biscuit to its original coordinates.
            </p>
          </div>
        )}

        {currentImage && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-8 mb-8 text-center">
            <div className="text-5xl">✅</div>
            <h2 className="mt-6 text-3xl font-black text-emerald-400">SCAN COMPLETE</h2>
            <p className="mt-3 text-emerald-200/70 text-lg">
              Data collected successfully. Ready for highly advanced mathematics.
            </p>
          </div>
        )}

        {/* Camera */}
        {!currentImage && (
          <div className="glass-panel p-2 rounded-[2.5rem] mb-8">
            <div className="overflow-hidden rounded-[2rem]">
              <Camera onCapture={handleCapture} />
            </div>
          </div>
        )}

        {/* Captured images */}
        {originalImage && (
          <div className="mt-8 grid md:grid-cols-2 gap-6">
            <div className="glass-panel rounded-3xl p-5">
              <p className="font-black text-xs tracking-widest text-neutral-400 mb-4 uppercase">Reference Scan</p>
              <img src={originalImage} alt="Original" className="w-full rounded-2xl shadow-lg border border-white/10" />
            </div>

            {currentImage && (
              <div className="glass-panel rounded-3xl p-5">
                <p className="font-black text-xs tracking-widest text-neutral-400 mb-4 uppercase">Damage Scan</p>
                <img src={currentImage} alt="Bite" className="w-full rounded-2xl shadow-lg border border-white/10" />
              </div>
            )}
          </div>
        )}

        {/* Calculate */}
        {currentImage && (
          <button
            type="button"
            onClick={calculateResult}
            className="mt-10 w-full py-6 bg-orange-600 text-white rounded-full font-black text-2xl uppercase tracking-widest glow-button"
          >
            Initialize Analysis
          </button>
        )}

        {/* Restart */}
        {originalImage && (
          <button
            type="button"
            onClick={resetExperiment}
            className="mt-6 w-full py-4 text-neutral-500 font-bold hover:text-white transition uppercase tracking-widest text-sm"
          >
            Abort Sequence
          </button>
        )}
      </div>
    </main>
  );
}