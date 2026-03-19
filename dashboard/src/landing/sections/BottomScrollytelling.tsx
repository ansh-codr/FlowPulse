import { useEffect, useRef, useState } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

const FRAME_COUNT = 240;
const PRELOAD_COUNT = 15;

const getFramePath = (index: number) => {
    const paddedIndex = index.toString().padStart(4, "0");
    return `/frames/frame_${paddedIndex}.jpg`;
};

export function BottomScrollytelling() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(FRAME_COUNT + 1).fill(null));
    const [loadedFrames, setLoadedFrames] = useState(0);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    const currentFrameRef = useRef(1);

    useEffect(() => {
        for (let i = 1; i <= PRELOAD_COUNT; i++) {
            const img = new Image();
            img.src = getFramePath(i);
            img.onload = () => {
                imagesRef.current[i] = img;
                setLoadedFrames(prev => prev + 1);
            };
        }

        setTimeout(() => {
            for (let i = PRELOAD_COUNT + 1; i <= FRAME_COUNT; i++) {
                const img = new Image();
                img.src = getFramePath(i);
                img.onload = () => {
                    imagesRef.current[i] = img;
                    setLoadedFrames(prev => Math.min(prev + 1, FRAME_COUNT));
                };
            }
        }, 500);
    }, []);

    useEffect(() => {
        const unsubscribe = scrollYProgress.on("change", (latest) => {
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
        let cWidth = canvas.parentElement?.clientWidth || window.innerWidth;
        let cHeight = canvas.parentElement?.clientHeight || window.innerHeight;

        const handleResize = () => {
            if (canvas.parentElement) {
                const rect = canvas.parentElement.getBoundingClientRect();
                cWidth = rect.width;
                cHeight = rect.height;
                canvas.width = cWidth;
                canvas.height = cHeight;
            }
        };

        window.addEventListener("resize", handleResize);
        handleResize();

        const render = () => {
            const frameIndex = currentFrameRef.current;
            const img = imagesRef.current[frameIndex];

            if (img && img.complete) {
                ctx.fillStyle = "#050505";
                ctx.fillRect(0, 0, cWidth, cHeight);

                const hRatio = cWidth / img.width;
                const vRatio = cHeight / img.height;
                const ratio = Math.max(hRatio, vRatio);

                const centerShiftX = (cWidth - img.width * ratio) / 2;
                const centerShiftY = (cHeight - img.height * ratio) / 2;

                ctx.drawImage(
                    img,
                    0, 0, img.width, img.height,
                    centerShiftX, centerShiftY, img.width * ratio, img.height * ratio
                );
            }

            animationFrameId = requestAnimationFrame(render);
        };
        render();

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener("resize", handleResize);
        };
    }, [loadedFrames]);

    // Opacity mapping for Bottom section narratives
    const feature2Opacity = useTransform(scrollYProgress, [0.05, 0.2, 0.4, 0.55], [0, 1, 1, 0]);
    const feature2Y = useTransform(scrollYProgress, [0.05, 0.2, 0.4, 0.55], [50, 0, 0, -50]);

    const ctaOpacity = useTransform(scrollYProgress, [0.45, 0.7, 1, 1], [0, 1, 1, 1]);
    const ctaY = useTransform(scrollYProgress, [0.45, 0.7], [50, 0]);

    return (
        <section ref={containerRef} id="technology" className="relative w-full h-[400vh] bg-[#050505]">
            <div className="sticky top-0 w-full h-screen overflow-hidden bg-[#050505] flex items-center justify-center">
                
                {/* Gradient transition from top section */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#050505] to-transparent z-10 pointer-events-none" />

                <canvas 
                    ref={canvasRef} 
                    className="absolute inset-0 w-full h-full object-cover z-0" 
                    style={{ filter: "brightness(0.7)" }} 
                />

                <div className="absolute inset-0 z-10 flex items-center w-full max-w-7xl mx-auto px-6 md:px-12 pointer-events-none">
                    
                    {/* Part 3: Deep Technical Highlight */}
                    <motion.div 
                        className="absolute w-full px-6 md:px-0 md:right-12 flex flex-col items-end justify-center h-full max-w-lg text-right right-0"
                        style={{ opacity: feature2Opacity, y: feature2Y }}
                    >
                        <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
                            Raw Performance.
                        </h2>
                        <p className="text-lg md:text-xl text-white/70 font-medium flex justify-end">
                            Lightning fast. Zero latency. Built natively for modern web capabilities to ensure absolute fluidity under heavy load.
                        </p>
                    </motion.div>

                    {/* Part 4: CTA Assembly */}
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
                {/* Gradient transition to footer */}
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#050505] to-transparent z-10 pointer-events-none" />
            </div>
        </section>
    );
}
