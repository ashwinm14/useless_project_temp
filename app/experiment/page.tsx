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
    <main className="min-h-screen px-5 py-8 relative overflow-hidden transition-colors duration-500">
      <div className="max-w-4xl mx-auto z-10 relative">
        {/* Header */}
        <header className="mb-10 text-center">
          <p className="text-sm font-black tracking-[0.4em] text-orange-600 uppercase">
            Bitecount Sequence
          </p>
          <h1 className="mt-3 text-5xl md:text-6xl font-black text-slate-700">
            Biscuit Experiment
          </h1>
        </header>

        {/* Progress */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className={`rounded-3xl p-5 font-bold transition-all duration-500 ${
              originalImage
                ? "neu-pressed text-orange-600"
                : "neu-flat text-slate-700"
            }`}
          >
            <p className="text-xs uppercase tracking-widest opacity-80">Phase 1</p>
            <p className="mt-1 text-lg">Whole Biscuit</p>
          </div>

          <div className={`rounded-3xl p-5 font-bold transition-all duration-500 ${
              currentImage
                ? "neu-pressed text-orange-600"
                : originalImage
                ? "neu-flat text-slate-700"
                : "neu-flat text-slate-500 opacity-50"
            }`}
          >
            <p className="text-xs uppercase tracking-widest opacity-80">Phase 2</p>
            <p className="mt-1 text-lg">After Bite</p>
          </div>
        </div>

        {/* Instructions */}
        {!originalImage && (
          <div className="neu-flat rounded-3xl p-8 mb-8 text-center text-slate-700">
            <div className="text-5xl animate-bounce">🍪</div>
            <h2 className="mt-6 text-3xl font-black">Target Acquired</h2>
            <p className="mt-3 text-slate-500 text-lg font-bold">
              Place the whole biscuit inside the scanner frame. Ensure maximum visibility.
            </p>
          </div>
        )}

        {originalImage && !currentImage && (
          <div className="neu-pressed rounded-3xl p-8 mb-8 text-center relative overflow-hidden text-slate-700">
            <div className="text-5xl">😋</div>
            <h2 className="mt-6 text-3xl font-black text-orange-600">INITIATE BITE</h2>
            <p className="mt-3 text-slate-500 text-lg font-bold">
              Take exactly one bite. Return the biscuit to its original coordinates.
            </p>
          </div>
        )}

        {currentImage && (
          <div className="neu-pressed rounded-3xl p-8 mb-8 text-center text-slate-700">
            <div className="text-5xl">✅</div>
            <h2 className="mt-6 text-3xl font-black text-orange-600">SCAN COMPLETE</h2>
            <p className="mt-3 text-slate-500 text-lg font-bold">
              Data collected successfully. Ready for highly advanced mathematics.
            </p>
          </div>
        )}

        {/* Camera */}
        {!currentImage && (
          <div className="neu-pressed p-4 rounded-[2.5rem] mb-8">
            <div className="overflow-hidden rounded-[1.5rem]">
              <Camera onCapture={handleCapture} />
            </div>
          </div>
        )}

        {/* Captured images */}
        {originalImage && (
          <div className="mt-8 grid md:grid-cols-2 gap-8">
            <div className="neu-flat rounded-3xl p-5">
              <p className="font-black text-xs tracking-widest text-slate-500 mb-4 uppercase text-center">Reference Scan</p>
              <img src={originalImage} alt="Original" className="w-full rounded-2xl" />
            </div>

            {currentImage && (
              <div className="neu-flat rounded-3xl p-5">
                <p className="font-black text-xs tracking-widest text-slate-500 mb-4 uppercase text-center">Damage Scan</p>
                <img src={currentImage} alt="Bite" className="w-full rounded-2xl" />
              </div>
            )}
          </div>
        )}

        {/* Calculate */}
        {currentImage && (
          <button
            type="button"
            onClick={calculateResult}
            className="mt-12 w-full py-6 neu-button neu-accent text-2xl uppercase tracking-widest"
          >
            Initialize Analysis
          </button>
        )}

        {/* Restart */}
        {originalImage && (
          <button
            type="button"
            onClick={resetExperiment}
            className="mt-8 w-full py-4 text-slate-500 font-bold transition uppercase tracking-widest text-sm hover:text-slate-700"
          >
            Abort Sequence
          </button>
        )}
      </div>
    </main>
  );
}