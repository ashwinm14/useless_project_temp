"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { analyzeBiscuitAction } from "@/app/actions/analyzeBiscuit";

// --- STEALTH OFFLINE FALLBACK ---
async function getImageData(dataUrl: string): Promise<ImageData> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const scale = Math.min(1, 400 / img.width);
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Could not get 2d context"));
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(ctx.getImageData(0, 0, canvas.width, canvas.height));
    };
    img.onerror = reject;
    img.src = dataUrl;
  });
}

function getReferenceColors(imageData: ImageData) {
  const data = imageData.data;
  let bgR = 0, bgG = 0, bgB = 0, bgCount = 0;
  let fgR = 0, fgG = 0, fgB = 0, fgCount = 0;

  for (let y = 0; y < imageData.height; y++) {
    for (let x = 0; x < imageData.width; x++) {
      const i = (y * imageData.width + x) * 4;
      const isEdge = x < imageData.width * 0.1 || x > imageData.width * 0.9 || y < imageData.height * 0.1 || y > imageData.height * 0.9;
      const isCenter = x > imageData.width * 0.4 && x < imageData.width * 0.6 && y > imageData.height * 0.4 && y < imageData.height * 0.6;

      if (isEdge) {
        bgR += data[i]; bgG += data[i+1]; bgB += data[i+2]; bgCount++;
      } else if (isCenter) {
        fgR += data[i]; fgG += data[i+1]; fgB += data[i+2]; fgCount++;
      }
    }
  }
  return {
    bg: { r: bgR / bgCount, g: bgG / bgCount, b: bgB / bgCount },
    fg: { r: fgR / fgCount, g: fgG / fgCount, b: fgB / fgCount }
  };
}

function processBiscuitImage(imageData: ImageData, colors: any) {
  const data = imageData.data;
  let biscuitPixels = 0;
  const colorDiff = Math.pow(colors.fg.r - colors.bg.r, 2) + Math.pow(colors.fg.g - colors.bg.g, 2) + Math.pow(colors.fg.b - colors.bg.b, 2);

  for (let i = 0; i < data.length; i += 4) {
    const distBg = Math.pow(data[i] - colors.bg.r, 2) + Math.pow(data[i+1] - colors.bg.g, 2) + Math.pow(data[i+2] - colors.bg.b, 2);
    const distFg = Math.pow(data[i] - colors.fg.r, 2) + Math.pow(data[i+1] - colors.fg.g, 2) + Math.pow(data[i+2] - colors.fg.b, 2);
    if (distFg < distBg && colorDiff > 100) biscuitPixels++;
  }
  return biscuitPixels;
}

const FALLBACK_JOKES = [
  "You eat like a timid mouse. Take a real bite!",
  "A perfectly symmetrical bite. Are you a robot?",
  "You demolished half the biscuit in one go. Slow down, Godzilla.",
  "Nibbling on the edges like it's a piece of fine cheese. Respectable.",
  "You went straight for the center. A chaotic neutral biscuit eater."
];
// --------------------------------

export default function ResultPage() {
  const router = useRouter();

  const [remaining, setRemaining] = useState<number | null>(null);
  const [bitesLeft, setBitesLeft] = useState<number | string | null>(null);
  const [personalityJoke, setPersonalityJoke] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [debugOriginal, setDebugOriginal] = useState<string | null>(null);
  const [debugCurrent, setDebugCurrent] = useState<string | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [rawAiResponse, setRawAiResponse] = useState<any>(null);

  useEffect(() => {
    async function calculateResult() {
      try {
        const originalDataUrl = localStorage.getItem("bitecount-original");
        const currentDataUrl = localStorage.getItem("bitecount-current");

        if (!originalDataUrl || !currentDataUrl) {
          router.push("/experiment");
          return;
        }

        setDebugOriginal(originalDataUrl);
        setDebugCurrent(currentDataUrl);

        // Try AI First
        const result = await analyzeBiscuitAction(originalDataUrl, currentDataUrl);

        if (!result.success || !result.data) {
          throw new Error(result.error || "Unknown AI error.");
        }

        const { remainingPercentage, estimatedBitesLeft, personalityJoke } = result.data;
        
        setRawAiResponse(result.data);
        setRemaining(remainingPercentage);
        setBitesLeft(estimatedBitesLeft);
        setPersonalityJoke(personalityJoke);

      } catch (e: any) {
        console.warn("AI failed (likely 503), engaging stealth offline fallback...", e);
        
        try {
          const originalDataUrl = localStorage.getItem("bitecount-original")!;
          const currentDataUrl = localStorage.getItem("bitecount-current")!;
          
          const originalImageData = await getImageData(originalDataUrl);
          const currentImageData = await getImageData(currentDataUrl);
          const colors = getReferenceColors(originalImageData);

          const originalArea = processBiscuitImage(originalImageData, colors);
          const currentArea = processBiscuitImage(currentImageData, colors);

          if (originalArea === 0) {
            setErrorMsg("Could not detect a biscuit in the image.");
            return;
          }

          const rawPercentage = (currentArea / originalArea) * 100;
          const remainingPercentage = Math.max(0, Math.min(100, Math.round(rawPercentage)));
          const biteSize = 100 - remainingPercentage;
          
          let estimatedBites: number | string = "?";
          if (biteSize > 0) estimatedBites = Math.max(1, Math.round(remainingPercentage / biteSize));

          setRemaining(remainingPercentage);
          setBitesLeft(estimatedBites);
          setPersonalityJoke(FALLBACK_JOKES[Math.floor(Math.random() * FALLBACK_JOKES.length)]);
          // Clear errorMsg so the user doesn't see anything wrong!
          setErrorMsg(null); 
        } catch (fallbackError) {
          setErrorMsg(e.message || "Failed to process.");
          setRemaining(0);
          setBitesLeft("Error");
          setPersonalityJoke("Everything failed. The biscuit has won.");
        }
      } finally {
        setIsCalculating(false);
      }
    }

    calculateResult();
  }, [router]);

  function restart() {
    localStorage.removeItem("bitecount-original");
    localStorage.removeItem("bitecount-current");
    router.push("/experiment");
  }

  if (isCalculating) {
    return (
      <main className="min-h-screen bg-[#f7f1e8] px-5 py-12 flex flex-col items-center justify-center">
        <div className="text-6xl animate-bounce mb-6">🍪</div>
        <h2 className="text-2xl font-black text-neutral-800">Analyzing your bites...</h2>
        <p className="mt-2 text-neutral-500">Please wait while we process the images.</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f1e8] px-5 py-12">
      <div className="max-w-3xl mx-auto text-center">
        <p className="text-sm font-black tracking-[0.3em] text-orange-600">
          BITECOUNT RESULTS
        </p>

        <h1 className="mt-5 text-5xl md:text-7xl font-black">
          YOU HAVE
        </h1>

        <div className="my-8">
          <p className="text-9xl font-black leading-none">
            {bitesLeft ?? "..."}
          </p>
          <p className="mt-4 text-2xl font-black tracking-wider">
            BITES LEFT
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-100 border border-red-200 text-red-800 p-4 rounded-2xl mb-8">
            <p className="font-bold uppercase tracking-wider text-sm mb-1">AI Error</p>
            <p>{errorMsg}</p>
          </div>
        )}

        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <p className="text-neutral-500 font-medium">
            Estimated Biscuit Remaining
          </p>

          <p className="mt-3 text-6xl font-black">
            {remaining ?? "..."}%
          </p>

          <div className="mt-7 h-6 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-700"
              style={{ width: `${remaining ?? 0}%` }}
            />
          </div>
        </div>

        <div className="mt-6 bg-neutral-900 text-white rounded-3xl p-8">
          <div className="text-5xl">
            {bitesLeft === "?" || bitesLeft === "Error" ? "🤔" : "🍪"}
          </div>

          <h2 className="mt-5 text-2xl font-black">
            BITE PERSONALITY
          </h2>

          <p className="mt-4 text-neutral-300 leading-relaxed text-lg">
            {personalityJoke}
          </p>
        </div>

        <button
          type="button"
          onClick={restart}
          className="mt-8 px-8 py-4 bg-orange-500 text-white rounded-full font-black hover:bg-orange-600 transition shadow-lg shadow-orange-500/30"
        >
          🍪 TRY AGAIN
        </button>
      </div>
    </main>
  );
}