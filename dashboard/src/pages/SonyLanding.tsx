import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const FRAME_COUNT = 240;

const preloadedImages: HTMLImageElement[] = [];

// Preload images
const preloadImages = () => {
  for (let i = 1; i <= FRAME_COUNT; i++) {
    const img = new Image();
    // Assets are hosted in public/sony-frames mirroring static delivery via CDN
    img.src = `/sony-frames/ezgif-frame-${String(i).padStart(3, '0')}.jpg`;
    preloadedImages[i] = img;
  }
};

export const SonyLanding = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Create a scroll context mapped to our 500vh container
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Map scroll progress seamlessly to 1-240 frame index
  const frameIndex = useTransform(scrollYProgress, [0, 1], [1, FRAME_COUNT]);
  const [imagesLoaded, setImagesLoaded] = useState(false);

  useEffect(() => {
    preloadImages();
    if (preloadedImages[1]) {
      preloadedImages[1].onload = () => setImagesLoaded(true);
    }
  }, []);

  // Use RequestAnimationFrame for smooth drawing synced to monitor refresh rate
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    // Explicitly optimize for 2D graphics
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const currentFrame = Math.round(frameIndex.get());
      const img = preloadedImages[currentFrame] || preloadedImages[1];

      if (img && img.complete) {
        const cw = canvas.width;
        const ch = canvas.height;
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, cw, ch);

        // object-fit: cover drawing implementation
        const imgRatio = img.width / img.height;
        const canvasRatio = cw / ch;
        let drawW, drawH, drawX, drawY;

        if (canvasRatio > imgRatio) {
          drawW = cw;
          drawH = cw / imgRatio;
          drawX = 0;
          drawY = (ch - drawH) / 2;
        } else {
          drawW = ch * imgRatio;
          drawH = ch;
          drawX = (cw - drawW) / 2;
          drawY = 0;
        }

        ctx.drawImage(img, drawX, drawY, drawW, drawH);
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Handle high-dpi sizing
    const setSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      ctx?.scale(dpr, dpr);
    };
    setSize();
    window.addEventListener('resize', setSize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', setSize);
    };
  }, [frameIndex, imagesLoaded]);

  // Transform constraints for scroll story overlays
  
  // 1. 0-15% (Hero)
  const heroOpacity = useTransform(scrollYProgress, [0, 0.1, 0.15], [1, 1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, -50]);

  // 2. 15-40% (Engineering Reveal)
  const engOpacity = useTransform(scrollYProgress, [0.15, 0.2, 0.35, 0.4], [0, 1, 1, 0]);
  const engY = useTransform(scrollYProgress, [0.15, 0.2, 0.35, 0.4], [50, 0, 0, -50]);

  // 3. 40-65% (Noise Cancelling)
  const ncOpacity = useTransform(scrollYProgress, [0.4, 0.45, 0.6, 0.65], [0, 1, 1, 0]);
  const ncY = useTransform(scrollYProgress, [0.4, 0.45, 0.6, 0.65], [50, 0, 0, -50]);

  // 4. 65-85% (Sound Quality)
  const sqOpacity = useTransform(scrollYProgress, [0.65, 0.7, 0.8, 0.85], [0, 1, 1, 0]);
  const sqY = useTransform(scrollYProgress, [0.65, 0.7, 0.8, 0.85], [50, 0, 0, -50]);

  // 5. 85-100% (Reassembly + CTA)
  const ctaOpacity = useTransform(scrollYProgress, [0.85, 0.9, 1], [0, 1, 1]);
  const ctaY = useTransform(scrollYProgress, [0.85, 0.9, 1], [50, 0, 0]);

  return (
    <div className="bg-[#050505] text-white font-sans selection:bg-[#0050FF]/30 h-full w-full">
      {/* Absolute strict dark theme layout */}
      <style>{`
        body, html {
          background-color: #050505 !important;
        }
      `}</style>

      {/* Navbar Minimal Glassmorphism */}
      <nav className="fixed top-0 z-50 w-full border-b border-white/5 bg-[#050505]/75 px-6 py-4 backdrop-blur-xl transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="text-xl font-bold tracking-tight text-white/90">WH-1000XM6</div>
          <div className="hidden space-x-8 text-sm font-medium text-white/60 md:flex">
            <a href="#" className="hover:text-white transition-colors duration-300">Overview</a>
            <a href="#" className="hover:text-white transition-colors duration-300">Technology</a>
            <a href="#" className="hover:text-white transition-colors duration-300">Noise Cancelling</a>
            <a href="#" className="hover:text-white transition-colors duration-300">Specs</a>
            <a href="#" className="hover:text-white transition-colors duration-300">Buy</a>
          </div>
          <button className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#050505] transition-transform duration-300 hover:scale-105">
            Experience WH-1000XM6
          </button>
        </div>
      </nav>

      {/* Main Scroll Orchestration Container */}
      <div ref={containerRef} className="relative h-[600vh]">
        {/* Sticky Rendering Canvas */}
        <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#050505]">
          {/* Subtle Accent Glow tied to product color language */}
          <div className="absolute left-1/2 top-1/2 h-[75vh] w-[75vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(0,80,255,0.08)_0%,rgba(5,5,5,0)_70%)] blur-[100px]" />
          
          <canvas ref={canvasRef} className="absolute inset-0 h-full w-full object-cover mix-blend-screen" />
          
          {/* Edge vignettes to soften image bounding rect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_40%,#050505_100%)] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/30 pointer-events-none" />
          
          {/* 1. Hero Overlay */}
          <motion.div style={{ opacity: heroOpacity, y: heroY }} className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            <h1 className="text-center font-display text-5xl font-extrabold tracking-tighter text-white/95 md:text-7xl lg:text-8xl drop-shadow-xl">
              Sony WH-1000XM6
            </h1>
            <p className="mt-8 text-xl font-medium tracking-wide text-white/70 md:text-2xl drop-shadow-md">
              Silence, perfected.
            </p>
          </motion.div>

          {/* 2. Engineering Reveal Overlay */}
          <motion.div style={{ opacity: engOpacity, y: engY }} className="absolute inset-0 flex items-center justify-start pointer-events-none p-8 md:p-24 z-10 w-full max-w-[1400px] mx-auto">
            <div className="max-w-md md:max-w-xl">
              <h2 className="text-4xl font-bold tracking-tight text-white/95 md:text-5xl lg:text-7xl">
                Precision-engineered<br />for silence.
              </h2>
              <div className="mt-8 space-y-4">
                <p className="text-lg text-white/70 md:text-xl font-light">
                  Carbon fiber drivers, acoustic isolation chambers, and an ultra-lightweight magnesium band redefine comfortable listening.
                </p>
              </div>
            </div>
          </motion.div>

          {/* 3. Noise Cancelling Overlay */}
          <motion.div style={{ opacity: ncOpacity, y: ncY }} className="absolute inset-0 flex items-center justify-end pointer-events-none p-8 md:p-24 z-10 w-full max-w-[1400px] mx-auto">
            <div className="max-w-md md:max-w-xl text-right">
              <h2 className="bg-gradient-to-r from-[#0050FF] to-[#00D6FF] bg-clip-text text-4xl font-bold tracking-tight text-transparent md:text-5xl lg:text-7xl">
                Adaptive noise cancelling, redefined.
              </h2>
              <ul className="mt-10 space-y-4 text-lg text-white/80 md:text-2xl font-medium track">
                <li className="flex items-center justify-end gap-3"><span className="h-1.5 w-1.5 rounded-full bg-[#00D6FF]" /> QN2e Processor</li>
                <li className="flex items-center justify-end gap-3"><span className="h-1.5 w-1.5 rounded-full bg-[#00D6FF]" /> 8-Microphone Array</li>
                <li className="flex items-center justify-end gap-3"><span className="h-1.5 w-1.5 rounded-full bg-[#00D6FF]" /> Auto-Environment Optimizer</li>
              </ul>
            </div>
          </motion.div>

          {/* 4. Sound Quality Overlay */}
          <motion.div style={{ opacity: sqOpacity, y: sqY }} className="absolute inset-0 flex items-center justify-start pointer-events-none p-8 md:p-24 z-10 w-full max-w-[1400px] mx-auto">
            <div className="max-w-md md:max-w-xl">
              <h2 className="text-4xl font-bold tracking-tight text-white/95 md:text-5xl lg:text-7xl">
                Immersive,<br />lifelike sound.
              </h2>
              <p className="mt-8 text-lg text-white/70 md:text-xl font-light">
                AI acoustic upscaling recovers high-frequency details lost in compression, bringing ultra-high-resolution studio fidelity to every track you play.
              </p>
            </div>
          </motion.div>

          {/* 5. CTA Assembly Overlay */}
          <motion.div style={{ opacity: ctaOpacity, y: ctaY }} className="absolute inset-x-0 bottom-0 top-auto flex flex-col items-center justify-end pb-[10vh] pointer-events-none z-10">
            <h2 className="text-4xl font-extrabold tracking-tight text-white/95 md:text-6xl text-center">
              Hear everything.<br />Feel nothing else.
            </h2>
            <div className="mt-12 flex flex-col sm:flex-row gap-6 z-50 pointer-events-auto">
              <button className="rounded-full bg-white px-10 py-4 text-lg font-semibold tracking-wide text-[#050505] transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                Experience WH-1000XM6
              </button>
              <button className="rounded-full border border-white/20 bg-white/5 px-10 py-4 text-lg font-medium tracking-wide text-white backdrop-blur-md transition-colors hover:bg-white/10">
                Tech Specs
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
