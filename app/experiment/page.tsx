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
      localStorage.setItem(
        "bitecount-original",
        originalImage
      );

      localStorage.setItem(
        "bitecount-current",
        currentImage
      );
    } catch (e) {
      console.warn("Could not save images to localStorage (they might be too large)", e);
    }

    router.push("/result");
  }

  return (
    <main className="min-h-screen bg-[#f7f1e8] px-5 py-8">

      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <header className="mb-8">

          <p className="text-sm font-black tracking-[0.3em] text-orange-600">
            BITECOUNT 🍪
          </p>

          <h1 className="mt-3 text-4xl md:text-5xl font-black">
            Biscuit Experiment
          </h1>

          <p className="mt-3 text-neutral-600">
            Let's perform some extremely important biscuit science.
          </p>

        </header>

        {/* Progress */}
        <div className="grid grid-cols-2 gap-3 mb-8">

          <div
            className={`rounded-2xl p-4 font-bold ${
              originalImage
                ? "bg-green-500 text-white"
                : "bg-orange-500 text-white"
            }`}
          >
            <p className="text-xs opacity-80">
              STEP 1
            </p>

            <p className="mt-1">
              Whole Biscuit
            </p>
          </div>

          <div
            className={`rounded-2xl p-4 font-bold ${
              currentImage
                ? "bg-green-500 text-white"
                : originalImage
                ? "bg-orange-500 text-white"
                : "bg-neutral-200 text-neutral-400"
            }`}
          >
            <p className="text-xs opacity-80">
              STEP 2
            </p>

            <p className="mt-1">
              After Bite
            </p>
          </div>

        </div>

        {/* Instructions */}
        {!originalImage && (
          <div className="bg-white rounded-3xl p-6 mb-6 shadow-sm">

            <div className="text-4xl">
              🍪
            </div>

            <h2 className="mt-4 text-2xl font-black">
              Put the whole biscuit in the frame
            </h2>

            <p className="mt-2 text-neutral-500">
              Place the biscuit inside the dashed box and make sure
              the entire biscuit is visible.
            </p>

          </div>
        )}

        {originalImage && !currentImage && (
          <div className="bg-orange-100 border border-orange-200 rounded-3xl p-6 mb-6">

            <div className="text-4xl">
              😋
            </div>

            <h2 className="mt-4 text-2xl font-black">
              NOW TAKE ONE BITE
            </h2>

            <p className="mt-2 text-neutral-700">
              Take exactly one bite, then place the biscuit back
              in approximately the same position.
            </p>

          </div>
        )}

        {currentImage && (
          <div className="bg-green-100 border border-green-300 rounded-3xl p-6 mb-6">

            <div className="text-4xl">
              🧪
            </div>

            <h2 className="mt-4 text-2xl font-black text-green-800">
              BITE RECORDED
            </h2>

            <p className="mt-2 text-green-700">
              We now have enough data to perform highly questionable
              biscuit mathematics.
            </p>

          </div>
        )}

        {/* Camera */}
        {!currentImage && (
          <Camera onCapture={handleCapture} />
        )}

        {/* Captured images */}
        {originalImage && (
          <div className="mt-8 grid md:grid-cols-2 gap-5">

            <div className="bg-white rounded-3xl p-4 shadow-sm">

              <p className="font-black text-sm tracking-wider mb-3">
                ORIGINAL
              </p>

              <img
                src={originalImage}
                alt="Original biscuit"
                className="w-full rounded-2xl"
              />

            </div>

            {currentImage && (
              <div className="bg-white rounded-3xl p-4 shadow-sm">

                <p className="font-black text-sm tracking-wider mb-3">
                  AFTER BITE
                </p>

                <img
                  src={currentImage}
                  alt="Biscuit after bite"
                  className="w-full rounded-2xl"
                />

              </div>
            )}

          </div>
        )}

        {/* Calculate */}
        {currentImage && (
          <button
            type="button"
            onClick={calculateResult}
            className="mt-8 w-full py-5 bg-neutral-900
            text-white rounded-2xl font-black text-xl
            hover:bg-orange-600 transition"
          >
            🧠 CALCULATE MY BITES
          </button>
        )}

        {/* Restart */}
        {originalImage && (
          <button
            type="button"
            onClick={resetExperiment}
            className="mt-4 w-full py-4 text-neutral-500
            font-bold hover:text-neutral-900 transition"
          >
            ↻ Restart Experiment
          </button>
        )}

      </div>

    </main>
  );
}