import React, { useEffect, useRef, useState } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

const FRAME_COUNT = 240;
const PRELOAD_COUNT = 15;

const getFramePath = (index: number) => {
    // Frames are 1-indexed and padded to 4 digits
    const paddedIndex = index.toString().padStart(4, "0");
    return `/frames/frame_${paddedIndex}.jpg`;
};

export function ScrollytellingSection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(FRAME_COUNT + 1).fill(null));
    const [loadedFrames, setLoadedFrames] = useState(0);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // We keep track of the current frame in a ref for requestAnimationFrame
    const currentFrameRef = useRef(1);

    useEffect(() => {
        // Preload initial frames
        for (let i = 1; i <= PRELOAD_COUNT; i++) {
            const img = new Image();
            img.src = getFramePath(i);
            img.onload = () => {
                imagesRef.current[i] = img;
                setLoadedFrames(prev => prev + 1);
            };
        }

        // Lazy load the rest progressively
        setTimeout(() => {
            for (let i = PRELOAD_COUNT + 1; i <= FRAME_COUNT; i++) {
                const img = new Image();
                img.src = getFramePath(i);
                img.onload = () => {
                    imagesRef.current[i] = img;
                    setLoadedFrames(prev => Math.min(prev + 1, FRAME_COUNT));
                };
            }
        }, 500); // Give the browser some breathing room before fetching the rest
    }, []);

    useEffect(() => {
        // Scroll listener to update frame index
        const unsubscribe = scrollYProgress.on("change", (latest) => {
            // Map 0-1 to 1-FRAME_COUNT
            const nextFrame = Math.max(1, Math.min(FRAME_COUNT, Math.floor(latest * FRAME_COUNT) + 1));
            currentFrameRef.current = nextFrame;
        });
        return () => unsubscribe();
    }, [scrollYProgress]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        let animationFrameId: number;

        const render = () => {
            const frameIndex = currentFrameRef.current;
            const img = imagesRef.current[frameIndex];

            if (img && img.complete) {
                // Resize canvas to match display size for High-DPI screens if possible, or just standard responsive
                const parent = canvas.parentElement;
                if (parent) {
                    const rect = parent.getBoundingClientRect();
                    // Set logical size to match container
                    if (canvas.width !== rect.width || canvas.height !== rect.height) {
                        canvas.width = rect.width;
                        canvas.height = rect.height;
                    }
                }

                // Fill background
                ctx.fillStyle = "#050505";
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Calculate aspect ratio
                const hRatio = canvas.width / img.width;
                const vRatio = canvas.height / img.height;
                // use max for 'cover', min for 'contain'. The user wants "Apple-style" which is usually cover or large contain.
                // "Maintain aspect ratio of images (no distortion) Center the sequence properly" -> let's use 'contain' or a large 'contain' that fills as much as possible, or 'cover'. Let's use 'cover' to ensure no blank spaces.
                const ratio = Math.max(hRatio, vRatio);

                const centerShiftX = (canvas.width - img.width * ratio) / 2;
                const centerShiftY = (canvas.height - img.height * ratio) / 2;

                ctx.drawImage(
                    img,
                    0, 0, img.width, img.height,
                    centerShiftX, centerShiftY, img.width * ratio, img.height * ratio
                );
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => cancelAnimationFrame(animationFrameId);
    }, [loadedFrames]); // Re-trigger standard render logic if an image loads 

    // Text Content Opacities mapped to scroll progress
    
    // 0-20%: Hero
    const heroOpacity = useTransform(scrollYProgress, [0, 0.1, 0.15, 0.2], [1, 1, 0, 0]);
    const heroY = useTransform(scrollYProgress, [0, 0.15], [0, -50]);

    // 20-50%: Product breakdown (Feature 1)
    const feature1Opacity = useTransform(scrollYProgress, [0.15, 0.25, 0.45, 0.5], [0, 1, 1, 0]);
    const feature1Y = useTransform(scrollYProgress, [0.15, 0.25, 0.45, 0.5], [50, 0, 0, -50]);

    // 50-80%: Technical Highlights (Feature 2)
    const feature2Opacity = useTransform(scrollYProgress, [0.45, 0.55, 0.75, 0.8], [0, 1, 1, 0]);
    const feature2Y = useTransform(scrollYProgress, [0.45, 0.55, 0.75, 0.8], [50, 0, 0, -50]);

    // 80-100%: CTA Phase
    const ctaOpacity = useTransform(scrollYProgress, [0.75, 0.85, 1, 1], [0, 1, 1, 1]);
    const ctaY = useTransform(scrollYProgress, [0.75, 0.85], [50, 0]);

    return (
        <section ref={containerRef} className="relative w-full h-[400vh] bg-[#050505]">
            <div className="sticky top-0 w-full h-screen overflow-hidden bg-[#050505] flex items-center justify-center">
                {/* Canvas Background */}
                <canvas 
                    ref={canvasRef} 
                    className="absolute inset-0 w-full h-full object-cover z-0" 
                    style={{ filter: "brightness(0.8)" }} // slight darkening for text readability
                />

                {/* Overlays / Story Content */}
                <div className="absolute inset-0 z-10 flex items-center w-full max-w-7xl mx-auto px-6 md:px-12 pointer-events-none">
                    
                    {/* 0-20%: Clean hero section */}
                    <motion.div 
                        className="absolute inset-0 flex flex-col items-center justify-center text-center w-full px-6"
                        style={{ opacity: heroOpacity, y: heroY }}
                    >
                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-6" style={{ textShadow: "0 4px 24px rgba(0,0,0,0.4)" }}>
                            The Pulse of Productivity
                        </h1>
                        <p className="text-lg md:text-2xl text-white/60 max-w-2xl mx-auto font-medium">
                            Experience the seamless blend of intelligent workflows and breathtaking design. Elevate your potential.
                        </p>
                    </motion.div>

                    {/* 20-50%: Product breakdown */}
                    <motion.div 
                        className="absolute w-full px-6 md:px-0 md:left-12 flex flex-col items-start justify-center h-full max-w-lg md:max-w-xl text-left"
                        style={{ opacity: feature1Opacity, y: feature1Y }}
                    >
                        <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
                            Intelligently Engineered.
                        </h2>
                        <p className="text-lg md:text-xl text-white/60 font-medium">
                            Every pixel purposefully placed. We stripped away the noise so you can focus on what actually matters—your core outcomes.
                        </p>
                    </motion.div>

                    {/* 50-80%: Technical / feature highlights */}
                    <motion.div 
                        className="absolute w-full px-6 md:px-0 md:right-12 flex flex-col items-end justify-center h-full max-w-lg text-right right-0"
                        style={{ opacity: feature2Opacity, y: feature2Y }}
                    >
                        <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
                            Raw Performance.
                        </h2>
                        <p className="text-lg md:text-xl text-white/60 font-medium flex justify-end">
                            Lightning fast. Zero latency. Built natively for modern web capabilities to ensure absolute fluidity under heavy load.
                        </p>
                    </motion.div>

                    {/* 80-100%: CTA Section */}
                    <motion.div 
                        className="absolute inset-0 flex flex-col items-center justify-center text-center w-full px-6"
                        style={{ opacity: ctaOpacity, y: ctaY }}
                    >
                        <div className="pointer-events-auto flex flex-col items-center">
                            <h2 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-8">
                                Ready to Flow?
                            </h2>
                            <div className="flex gap-4 flex-col sm:flex-row">
                                <a href="/login" className="rounded-full bg-white text-black px-8 py-4 text-lg font-semibold hover:scale-105 transition-transform">
                                    Get Started Free
                                </a>
                                <a href="#learn-more" className="rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-white px-8 py-4 text-lg font-semibold hover:bg-white/10 transition-colors">
                                    View Technical Specs
                                </a>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Optional dark gradient overlay at the bottom for smooth transition to footer */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050505] to-transparent z-10 pointer-events-none" />
            </div>
        </section>
    );
}
