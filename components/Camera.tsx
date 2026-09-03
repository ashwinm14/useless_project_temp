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
    <div className="w-full relative group">
      {/* Camera wrapper */}
      <div 
        ref={containerRef}
        className="relative w-full aspect-[4/5] md:aspect-video bg-black rounded-[2rem] overflow-hidden shadow-[0_0_30px_rgba(255,107,0,0.1)] border border-white/10"
      >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover opacity-80"
        />

        {/* Decorative corner brackets */}
        <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-orange-500/70" />
        <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-orange-500/70" />
        <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-orange-500/70" />
        <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-orange-500/70" />

        {/* Guide box */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            ref={guideBoxRef}
            className="relative w-[65%] max-w-sm aspect-[1.5] border-2 rounded-2xl border-orange-500/50 shadow-[0_0_15px_rgba(255,107,0,0.3)_inset] overflow-hidden"
          >
            {/* Scanning Laser */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-orange-400 shadow-[0_0_8px_#ff6b00] animate-[float_3s_ease-in-out_infinite]" />
            
            <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-xs font-mono tracking-widest whitespace-nowrap px-4 py-2 rounded-full glass-panel text-orange-400 border border-orange-500/30 uppercase">
              ALIGN TARGET
            </span>
          </div>
        </div>

        {/* Camera starting */}
        {!cameraStarted && !error && (
          <div className="absolute inset-0 flex items-center justify-center backdrop-blur-md bg-black/40">
            <div className="glass-panel text-orange-400 px-6 py-4 rounded-full font-mono text-sm tracking-widest animate-pulse border border-orange-500/30 uppercase">
              Initializing Optics...
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center p-6 backdrop-blur-lg bg-black/60">
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-6 rounded-3xl text-center max-w-md">
              <p className="font-black text-xl mb-2 tracking-widest uppercase">Optics Failure</p>
              <p className="text-sm font-light text-red-200">{error}</p>
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      {/* Manual Capture button */}
      <button
        type="button"
        onClick={captureImage}
        disabled={!cameraStarted}
        className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-10 py-5 text-white rounded-full font-black text-lg transition-all duration-300 disabled:opacity-0 disabled:pointer-events-none bg-orange-600 shadow-[0_10px_40px_rgba(255,107,0,0.4)] hover:bg-orange-500 hover:-translate-y-1 hover:shadow-[0_15px_50px_rgba(255,107,0,0.6)] active:translate-y-0 active:shadow-none uppercase tracking-widest border border-orange-400/50"
      >
        CAPTURE
      </button>
    </div>
  );
}