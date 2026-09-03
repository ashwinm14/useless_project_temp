"use client";

import { useEffect, useRef, useState } from "react";

interface CameraProps {
  onCapture: (image: string) => void;
}

export default function Camera({ onCapture }: CameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraStarted, setCameraStarted] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function startCamera() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          if (mounted) setError("Your browser does not support camera access.");
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });

        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraStarted(true);
        }
      } catch (error) {
        console.error("Camera error:", error);
        if (mounted) {
          if (error instanceof Error) {
            if (error.name === "NotReadableError" || error.name === "TrackStartError") {
              setError("Camera is in use by another application or tab. Please close it, fully refresh this page, and try again.");
              return;
            }
            if (error.name === "NotAllowedError") {
              setError("Camera access was denied. Please allow camera permission in your browser and refresh.");
              return;
            }
          }
          setError("Camera could not be started. Please check your permissions and hardware.");
        }
      }
    }

    startCamera();

    return () => {
      mounted = false;
      stopCamera();
    };
  }, []);



  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }

  const containerRef = useRef<HTMLDivElement>(null);
  const guideBoxRef = useRef<HTMLDivElement>(null);

  function captureImage() {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const guideBox = guideBoxRef.current;

    if (!video || !canvas || !container || !guideBox) return;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setError("Camera is not ready yet. Please wait a moment.");
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      setError("Could not process camera image.");
      return;
    }

    // 1. Get DOM dimensions
    const videoRect = container.getBoundingClientRect();
    const guideRect = guideBox.getBoundingClientRect();

    // 2. Calculate actual rendered video dimensions (due to object-cover)
    const videoAspect = video.videoWidth / video.videoHeight;
    const containerAspect = videoRect.width / videoRect.height;

    let renderWidth, renderHeight;
    if (containerAspect > videoAspect) {
      // Container is proportionally wider than the video
      renderWidth = videoRect.width;
      renderHeight = videoRect.width / videoAspect;
    } else {
      // Container is proportionally taller than the video
      renderHeight = videoRect.height;
      renderWidth = videoRect.height * videoAspect;
    }

    // 3. Calculate scale factor from rendered size to natural video size
    const scale = video.videoWidth / renderWidth;

    // 4. Calculate the offset of the video within its container (since it's centered)
    const offsetX = (renderWidth - videoRect.width) / 2;
    const offsetY = (renderHeight - videoRect.height) / 2;

    // 5. Calculate the exact crop coordinates on the natural video resolution
    const cropX = (guideRect.left - videoRect.left + offsetX) * scale;
    const cropY = (guideRect.top - videoRect.top + offsetY) * scale;
    const cropWidth = guideRect.width * scale;
    const cropHeight = guideRect.height * scale;

    // 6. Draw ONLY the cropped area
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    context.drawImage(
      video,
      cropX, cropY, cropWidth, cropHeight, // Source crop
      0, 0, cropWidth, cropHeight          // Destination
    );

    const image = canvas.toDataURL("image/jpeg", 0.9);
    onCapture(image);
  }

  return (
    <div className="w-full relative group p-2">
      {/* Camera wrapper */}
      <div 
        ref={containerRef}
        className="relative w-full aspect-[4/5] md:aspect-video neu-pressed overflow-hidden"
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Inner shadow overlay for depth */}
        <div className="absolute inset-0 pointer-events-none rounded-[2rem] shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]" />

        {/* Guide box */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            ref={guideBoxRef}
            className="relative w-[65%] max-w-sm aspect-[1.5] border-2 rounded-2xl border-white/50 shadow-sm overflow-hidden mix-blend-overlay"
          >
            {/* Soft scanning line */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-white/70 shadow-sm animate-[float_3s_ease-in-out_infinite]" />
            
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-xs font-bold tracking-widest whitespace-nowrap px-4 py-2 rounded-full bg-white/30 backdrop-blur-sm text-black/70 uppercase">
              ALIGN TARGET
            </span>
          </div>
        </div>

        {/* Camera starting */}
        {!cameraStarted && !error && (
          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-md bg-[#e0e5ec]/60">
            <div className="neu-flat text-slate-700 px-6 py-4 rounded-full font-bold text-sm tracking-widest uppercase">
              Initializing Optics...
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-6 backdrop-blur-lg bg-[#e0e5ec]/80">
            <div className="neu-pressed text-orange-600 p-6 rounded-3xl text-center max-w-md border border-orange-600/20">
              <p className="font-black text-xl mb-2 tracking-widest uppercase">Optics Failure</p>
              <p className="text-sm font-bold">{error}</p>
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Manual Capture button */}
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[200px]">
        <button
          type="button"
          onClick={captureImage}
          disabled={!cameraStarted}
          className="w-full py-5 text-slate-700 disabled:opacity-0 disabled:pointer-events-none uppercase tracking-widest text-lg neu-button"
        >
          Capture
        </button>
      </div>
    </div>
  );
}